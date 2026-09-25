package com.puff.tech.security;

import lombok.Builder;

import java.util.List;

@Builder
public record UserSecurityContext(
        String subject,
        String userId,
        List<String> roles,
        List<String> permissions,
        boolean enabled,
        Long memberId
) {
}
