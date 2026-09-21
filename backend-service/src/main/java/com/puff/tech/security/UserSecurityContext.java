package com.puff.tech.security;

import java.util.List;

public record UserSecurityContext(
        String subject,
        String userId,
        String role,
        String permission,
        boolean enabled
) {}
