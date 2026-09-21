package com.puff.tech.security;

import reactor.core.publisher.Mono;
import reactor.util.context.Context;

public class SecurityContextHolder {
    // Made package-private so SecurityInterceptor can build unified contexts
    static final String SECURITY_TOKEN_KEY = "SECURITY_TOKEN";
    static final String SECURITY_CONTEXT_KEY = "USER_SECURITY_CONTEXT";

    public static Context withToken(String token) {
        return Context.of(SECURITY_TOKEN_KEY, token);
    }

    public static Context withSecurityContext(UserSecurityContext context) {
        return Context.of(SECURITY_CONTEXT_KEY, context);
    }

    // Resolves both values safely into a single UseCaseContext
    public static Mono<UseCaseContext> getUseCaseContext() {
        return Mono.deferContextual(ctx -> {
            String token = ctx.getOrDefault(SECURITY_TOKEN_KEY, "");
            UserSecurityContext securityContext = ctx.getOrDefault(SECURITY_CONTEXT_KEY, null);

            return Mono.just(new UseCaseContext(securityContext, token));
        });
    }
}