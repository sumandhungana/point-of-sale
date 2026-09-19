package com.puff.tech.security;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.MutableHttpResponse;
import io.micronaut.http.annotation.Filter;
import io.micronaut.http.filter.HttpServerFilter;
import io.micronaut.http.filter.ServerFilterChain;
import jakarta.inject.Singleton;
import org.reactivestreams.Publisher;
import reactor.core.publisher.Mono;

import java.util.Optional;

@Filter("/**")
@Singleton
public class SecurityInterceptor implements HttpServerFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    @Override
    public Publisher<MutableHttpResponse<?>> doFilter(HttpRequest<?> request, ServerFilterChain chain) {
        String token = extractToken(request);

        return Mono.from(chain.proceed(request))
                // Attach the token to the Reactor Context for downstream use
                .contextWrite(SecurityContextHolder.withToken(token));
    }

    private String extractToken(HttpRequest<?> request) {
        return Optional.ofNullable(request.getHeaders().get(AUTHORIZATION_HEADER))
                .filter(header -> header.startsWith(BEARER_PREFIX))
                .map(header -> header.substring(BEARER_PREFIX.length()))
                .orElse("");
    }
}
