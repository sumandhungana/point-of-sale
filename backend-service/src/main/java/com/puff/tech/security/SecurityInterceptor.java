package com.puff.tech.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micronaut.aop.MethodInterceptor;
import io.micronaut.aop.MethodInvocationContext;
import io.micronaut.core.annotation.AnnotationValue;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.context.ServerRequestContext;
import io.micronaut.http.exceptions.HttpStatusException;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.*;

@Singleton
public class SecurityInterceptor implements MethodInterceptor<Object, Object> {

    private static final Logger LOG = LoggerFactory.getLogger(SecurityInterceptor.class);
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final SecurityDataService securityDataService;

    @Inject
    public SecurityInterceptor(SecurityDataService securityDataService) {
        this.securityDataService = securityDataService;
    }

    @Override
    public Object intercept(MethodInvocationContext<Object, Object> context) {
        AnnotationValue<Secured> securedAnnotation = context.getAnnotation(Secured.class);
        if (securedAnnotation == null) {
            return context.proceed();
        }

        String[] requiredRoles = securedAnnotation.stringValues("roles");
        String[] requiredPermissions = securedAnnotation.stringValues("permissions");

        Optional<HttpRequest<Object>> requestOpt = ServerRequestContext.currentRequest();
        if (requestOpt.isEmpty()) {
            return handleSecurityFailure(context, HttpStatus.UNAUTHORIZED, "No request context");
        }

        HttpRequest<?> request = requestOpt.get();
        String token = extractToken(request);
        if (token == null) {
            return handleSecurityFailure(context, HttpStatus.UNAUTHORIZED, "Missing authorization token");
        }

        JsonNode claims = extractClaimsFromJwt(token);
        if (claims == null) {
            return handleSecurityFailure(context, HttpStatus.UNAUTHORIZED, "Invalid JWT format");
        }

        // Extract IDs from Token Claims
        Long roleId = parseLongClaim(claims, "roles");
        String permissionIds = getClaimValue(claims, "permissions");
        String subject = getClaimValue(claims, "sub");
        String userId = getClaimValue(claims, "userId");
        Long memberId = parseLongClaim(claims, "memberId");

        if (roleId == null) {
            return handleSecurityFailure(context, HttpStatus.UNAUTHORIZED, "Token missing roleId claim");
        }

        // Fetch permissions from DB and validate reactively
        Mono<Object> executionMono = securityDataService.fetchSecurityDetails(roleId, permissionIds, memberId)
                .switchIfEmpty(Mono.error(new HttpStatusException(HttpStatus.UNAUTHORIZED, "Security record not found")))
                .flatMap(details -> {
                    if (!details.enabled()) {
                        return Mono.error(new HttpStatusException(HttpStatus.UNAUTHORIZED, "User role or account disabled"));
                    }

                    // Validate Roles
                    if (requiredRoles.length > 0 && lacksAccess(Set.of(details.roleName()), requiredRoles)) {
                        return Mono.error(new HttpStatusException(HttpStatus.FORBIDDEN, "Insufficient role privileges"));
                    }

                    // Validate Permissions
                    if (requiredPermissions.length > 0 && lacksAccess(details.permissions(), requiredPermissions)) {
                        return Mono.error(new HttpStatusException(HttpStatus.FORBIDDEN, "Insufficient permission privileges"));
                    }

                    UserSecurityContext userSecurityContext = UserSecurityContext.builder()
                            .subject(subject)
                            .userId(userId)
                            .memberId(memberId)
                            .roles(List.of(details.roleName()))
                            .permissions(new ArrayList<>(details.permissions()))
                            .enabled(details.enabled())
                            .build();

                    UseCaseContext useCaseContext = UseCaseContext.builder()
                            .token(token)
                            .securityContext(userSecurityContext)
                            .build();

                    return Mono.deferContextual(ctx -> (Mono<?>) context.proceed())
                            .contextWrite(ctx -> SecurityContextHolder.withSecurityContext(ctx, useCaseContext));
                });

        return adaptExecutionToReturnType(context, executionMono);
    }

    private boolean hasAccess(Collection<String> userAuthorities, String[] requiredAuthorities) {
        if (userAuthorities == null || userAuthorities.isEmpty()) return false;
        for (String required : requiredAuthorities) {
            if (userAuthorities.contains(required)) {
                return true;
            }
        }
        return false;
    }
    private boolean lacksAccess(Collection<String> userAuthorities, String[] requiredAuthorities) {
        if (userAuthorities == null || userAuthorities.isEmpty()) return true;
        for (String required : requiredAuthorities) {
            if (userAuthorities.contains(required)) {
                return false; // User has access
            }
        }
        return true; // User lacks all required authorities
    }

    private Object adaptExecutionToReturnType(MethodInvocationContext<Object, Object> context, Mono<Object> executionMono) {
        Class<?> returnType = context.getReturnType().getType();

        if (Mono.class.isAssignableFrom(returnType)) {
            return executionMono;
        }

        if (Flux.class.isAssignableFrom(returnType)) {
            return executionMono.flatMapMany(result -> (Flux<?>) result);
        }

        // Block for non-reactive synchronous controller endpoints
        return executionMono.block();
    }

    private String extractToken(HttpRequest<?> request) {
        Optional<String> authHeader = request.getHeaders().findFirst(AUTHORIZATION_HEADER);
        if (authHeader.isPresent() && authHeader.get().startsWith(BEARER_PREFIX)) {
            return authHeader.get().substring(BEARER_PREFIX.length()).trim();
        }
        return null;
    }

    private JsonNode extractClaimsFromJwt(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) return null;
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            return objectMapper.readTree(payload);
        } catch (Exception e) {
            LOG.error("Error decoding JWT", e);
            return null;
        }
    }

    private String getClaimValue(JsonNode claims, String... claimNames) {
        for (String claimName : claimNames) {
            JsonNode node = claims.get(claimName);
            if (node != null && !node.isNull()) {
                return node.asText();
            }
        }
        return null;
    }

    private Long parseLongClaim(JsonNode claims, String claimName) {
        JsonNode node = claims.get(claimName);
        if (node != null && !node.isNull()) {
            return node.asLong();
        }
        return null;
    }

    private Object handleSecurityFailure(MethodInvocationContext<Object, Object> context, HttpStatus status, String message) {
        Class<?> returnType = context.getReturnType().getType();
        HttpStatusException exception = new HttpStatusException(status, message);

        if (Mono.class.isAssignableFrom(returnType)) {
            return Mono.error(exception);
        }
        if (Flux.class.isAssignableFrom(returnType)) {
            return Flux.error(exception);
        }
        throw exception;
    }
}