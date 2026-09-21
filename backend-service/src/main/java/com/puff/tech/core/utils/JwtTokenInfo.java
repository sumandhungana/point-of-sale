package com.puff.tech.core.utils;

public record JwtTokenInfo(
        String subject,
        String userId,
        String userName,
        String role,
        String permission,
        boolean enabled,
        String memberId) {
}
