package com.puff.tech.security;

import io.micronaut.http.HttpRequest;
import io.micronaut.http.MutableHttpResponse;
import io.micronaut.http.annotation.Filter;
import io.micronaut.http.filter.HttpServerFilter;
import io.micronaut.http.filter.ServerFilterChain;
import jakarta.inject.Singleton;
import org.reactivestreams.Publisher;
import reactor.core.publisher.Mono;
import reactor.util.context.Context;

import java.util.Optional;
import java.util.Set;

@Filter("/**")
@Singleton
public class SecurityInterceptor implements HttpServerFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    // Public routes that bypass token validation
    private static final Set<String> PUBLIC_ENDPOINTS = Set.of(
            "/api/v1/user/login",
            "/api/v1/user/register"
    );

    private final JwtTokenProvider tokenProvider;

    public SecurityInterceptor(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    public Publisher<MutableHttpResponse<?>> doFilter(HttpRequest<?> request, ServerFilterChain chain) {
        String path = request.getPath();

        // 1. Bypass authentication context for public endpoints
        if (isPublicEndpoint(path)) {
            return chain.proceed(request);
        }

        // 2. Extract token and security context
        String token = extractToken(request);
        UserSecurityContext securityContext = tokenProvider.extractSecurityContext(token);

        Mono<MutableHttpResponse<?>> responseMono = Mono.from(chain.proceed(request));

        // 3. Safely build Reactor Context without null values
        Context combinedContext = Context.empty();
        if (token != null && !token.isBlank()) {
            combinedContext = combinedContext.put(SecurityContextHolder.SECURITY_TOKEN_KEY, token);
        }
        if (securityContext != null) {
            combinedContext = combinedContext.put(SecurityContextHolder.SECURITY_CONTEXT_KEY, securityContext);
        }

        // 4. Attach context upstream
        return responseMono.contextWrite(combinedContext);
    }

    private boolean isPublicEndpoint(String path) {
        return PUBLIC_ENDPOINTS.stream().anyMatch(path::startsWith);
    }

    private String extractToken(HttpRequest<?> request) {
        return Optional.ofNullable(request.getHeaders().get(AUTHORIZATION_HEADER))
                .filter(header -> header.startsWith(BEARER_PREFIX))
                .map(header -> header.substring(BEARER_PREFIX.length()))
                .orElse("");
    }
}