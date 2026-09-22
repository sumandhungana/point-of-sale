package com.puff.tech.security;

import lombok.Builder;

@Builder
public record UserSecurityContext(
        String subject,
        String userId,
        String role,
        String permission,
        boolean enabled,
        Long memberId
) {
}
