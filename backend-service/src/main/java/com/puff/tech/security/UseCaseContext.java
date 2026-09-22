package com.puff.tech.security;

import lombok.Builder;

@Builder
public record UseCaseContext(
        UserSecurityContext securityContext,
        String token
) {
    public static UseCaseContext empty() {
        return new UseCaseContext(null, "");
    }

    public boolean isAuthenticated() {
        return securityContext != null;
    }
}