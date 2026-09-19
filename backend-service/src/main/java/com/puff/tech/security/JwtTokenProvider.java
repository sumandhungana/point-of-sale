package com.puff.tech.security;

import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.inject.Singleton;

import java.text.ParseException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Singleton
public class JwtTokenProvider {

    @SuppressWarnings("unchecked")
    public UserSecurityContext extractSecurityContext(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();

            // Extract Username (standard 'sub' claim)
            String username = claims.getSubject();

            // Extract Roles (e.g., custom "roles" claim array)
            List<String> roles = Optional.ofNullable((List<String>) claims.getClaim("roles"))
                    .orElse(Collections.emptyList());

            // Extract Permissions (e.g., custom "permissions" claim array)
            List<String> permissions = Optional.ofNullable((List<String>) claims.getClaim("permissions"))
                    .orElse(Collections.emptyList());

            return new UserSecurityContext(username, roles, permissions);

        } catch (ParseException e) {
            throw new IllegalArgumentException("Invalid or malformed JWT token", e);
        }
    }
}
