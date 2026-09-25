package com.puff.tech.security;

import io.micronaut.serde.annotation.Serdeable;

import java.util.Set;

@Serdeable
public record RolePermissionDetails(
        String roleName,
        Set<String> permissions,
        boolean enabled
) {
}
