package com.puff.tech.security;

import java.util.List;

public record UserSecurityContext(
        String username,
        List<String> roles,
        List<String> permissions
) {}
