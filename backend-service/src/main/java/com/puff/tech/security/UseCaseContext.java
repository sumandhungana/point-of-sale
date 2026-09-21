package com.puff.tech.security;

import com.puff.tech.security.UserSecurityContext;

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