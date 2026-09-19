package com.puff.tech.security;
import reactor.core.publisher.Mono;
import reactor.util.context.Context;

import java.util.Optional;

public class SecurityContextHolder {
    private static final String SECURITY_TOKEN_KEY = "SECURITY_TOKEN";

    // Writes token into Reactor Context
    public static Context withToken(String token) {
        return Context.of(SECURITY_TOKEN_KEY, token);
    }

    // Reads token from current Reactor Context
    public static Mono<String> getToken() {
        return Mono.deferContextual(ctx ->
                Mono.justOrEmpty(ctx.<String>getOrEmpty(SECURITY_TOKEN_KEY))
        );
    }
    private static final String SECURITY_CONTEXT_KEY = "USER_SECURITY_CONTEXT";

    // Attach parsed context to Reactor Pipeline
    public static Context withSecurityContext(UserSecurityContext context) {
        return Context.of(SECURITY_CONTEXT_KEY, context);
    }

    // Retrieve parsed context
    public static Mono<UserSecurityContext> getSecurityContext() {
        return Mono.deferContextual(ctx ->
                Mono.justOrEmpty(ctx.<UserSecurityContext>getOrEmpty(SECURITY_CONTEXT_KEY))
        );
    }
}
