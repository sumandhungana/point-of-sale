package com.puff.tech.security;

import io.micronaut.aop.MethodInterceptor;
import io.micronaut.aop.MethodInvocationContext;
import io.micronaut.core.annotation.AnnotationValue;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.context.ServerRequestContext;
import jakarta.inject.Singleton;
import org.reactivestreams.Publisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Base64;
import java.util.Optional;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Singleton
public class SecurityInterceptor implements MethodInterceptor<Object, Object> {

    private static final Logger LOG = LoggerFactory.getLogger(SecurityInterceptor.class);
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Object intercept(MethodInvocationContext<Object, Object> context) {
        LOG.debug("SecurityInterceptor invoked for method: {}", context.getMethodName());

        AnnotationValue<Secured> securedAnnotation = context.getAnnotation(Secured.class);
        String[] requiredRoles = securedAnnotation != null ?
                securedAnnotation.stringValues("roles") : new String[]{};

        Optional<HttpRequest<Object>> requestOpt = ServerRequestContext.currentRequest();

        if (requestOpt.isEmpty()) {
            LOG.warn("No HTTP request context available");
            return handleUnauthorized(context, "No request context");
        }

        HttpRequest<?> request = requestOpt.get();
        String token = extractToken(request);

        if (token == null) {
            LOG.warn("No authorization token found");
            return handleUnauthorized(context, "Missing authorization token");
        }

        UseCaseContext securityContext = validateAndCreateContext(token, requiredRoles);

        if (securityContext == null) {
            return handleUnauthorized(context, "Invalid token or insufficient permissions");
        }

        return proceedWithContext(context, securityContext);
    }

    private String extractToken(HttpRequest<?> request) {
        Optional<String> authHeader = request.getHeaders().findFirst(AUTHORIZATION_HEADER);
        if (authHeader.isPresent() && authHeader.get().startsWith(BEARER_PREFIX)) {
            return authHeader.get().substring(BEARER_PREFIX.length());
        }
        return null;
    }

    private UseCaseContext validateAndCreateContext(String token, String[] requiredRoles) {
        try {
            JsonNode claims = extractClaimsFromJwt(token);
            if (claims != null) {
                String userId = getClaimValue(claims, "subject", "userId");
                String permission = getClaimValue(claims, "permission");
                String roles = getClaimValue(claims, "roles");
                String memberId = getClaimValue(claims, "memberId");
                // TODO: Implement your token validation logic here
                return UseCaseContext.builder()
                        .token(token)
                        .securityContext(UserSecurityContext.builder()
                                .subject(userId)
                                .userId(userId)
                                .memberId(memberId)
                                .permission(permission)
                                .role(roles)
                                .build()).build();
            }
//            if (requiredRoles.length > 0) {
//                // TODO: Implement role validation
//            }

            return null;
        } catch (Exception e) {
            LOG.error("Error validating token", e);
            return null;
        }
    }

    private JsonNode extractClaimsFromJwt(String token) {
        try {
            // JWT format: header.payload.signature
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                LOG.warn("Invalid JWT format");
                return null;
            }

            // Decode payload (second part)
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

    private boolean hasRequiredRoles(JsonNode claims, String[] requiredRoles) {
        // Check common role claim locations
        JsonNode rolesNode = claims.get("roles");
        if (rolesNode == null) {
            rolesNode = claims.get("authorities");
        }
        if (rolesNode == null) {
            JsonNode realmAccess = claims.get("realm_access");
            if (realmAccess != null) {
                rolesNode = realmAccess.get("roles");
            }
        }

        if (rolesNode == null || !rolesNode.isArray()) {
            return false;
        }

        for (String requiredRole : requiredRoles) {
            boolean found = false;
            for (JsonNode roleNode : rolesNode) {
                if (requiredRole.equalsIgnoreCase(roleNode.asText())) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                return false;
            }
        }
        return true;
    }

    private Object proceedWithContext(MethodInvocationContext<Object, Object> context, UseCaseContext securityContext) {
        Class<?> returnType = context.getReturnType().getType();

        if (Mono.class.isAssignableFrom(returnType)) {
            return Mono.deferContextual(ctx -> {
                Object result = context.proceed();
                return (Mono<?>) result;
            }).contextWrite(ctx -> SecurityContextHolder.withSecurityContext(ctx, securityContext));
        }

        if (Flux.class.isAssignableFrom(returnType)) {
            return Flux.deferContextual(ctx -> {
                Object result = context.proceed();
                return (Flux<?>) result;
            }).contextWrite(ctx -> SecurityContextHolder.withSecurityContext(ctx, securityContext));
        }

        if (Publisher.class.isAssignableFrom(returnType)) {
            return Flux.deferContextual(ctx -> {
                Object result = context.proceed();
                return Flux.from((Publisher<?>) result);
            }).contextWrite(ctx -> SecurityContextHolder.withSecurityContext(ctx, securityContext));
        }

        // Non-reactive - just proceed
        return context.proceed();
    }

    private Object handleUnauthorized(MethodInvocationContext<Object, Object> context, String message) {
        Class<?> returnType = context.getReturnType().getType();

        if (Mono.class.isAssignableFrom(returnType)) {
            return Mono.error(new SecurityException(message));
        }

        if (Flux.class.isAssignableFrom(returnType)) {
            return Flux.error(new SecurityException(message));
        }

        throw new SecurityException(message);
    }
}