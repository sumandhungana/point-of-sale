package com.puff.tech.security;

import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.inject.Singleton;

import java.text.ParseException;
import java.util.Optional;

@Singleton
public class JwtTokenProvider {

//    public UserSecurityContext extractSecurityContext(String token) {
//        if (token == null || token.isBlank()) {
//            return null;
//        }
//
//        try {
//            SignedJWT signedJWT = SignedJWT.parse(token);
//            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();
//
//            // Extract Username (standard 'sub' claim)
//            String username = claims.getSubject();
//
//            // Safely extract userId
//            String userId = Optional.ofNullable(claims.getClaim("userId"))
//                    .map(Object::toString)
//                    .orElse("");
//
//            // Safely extract roles (handles String or List/Array toString conversion)
//            String roles = Optional.ofNullable(claims.getClaim("roles"))
//                    .map(Object::toString)
//                    .orElse("");
//
//            // Safely extract permissions
//            String permissions = Optional.ofNullable(claims.getClaim("permissions"))
//                    .map(Object::toString)
//                    .orElse("");
//
//            // Safely extract enabled flag
//            boolean enabled = Optional.ofNullable(claims.getBooleanClaim("enabled"))
//                    .orElse(false);
//
//            Long memberId = Optional.ofNullable(claims.getClaim("memberId"))
//                    .map(Object::toString)
//                    .map(Long::valueOf)
//                    .orElse(null);
//
//            return new UserSecurityContext(username, userId, roles, permissions, enabled, memberId);
//
//        } catch (ParseException e) {
//            // Return null on malformed tokens so downstream pipeline receives empty context instead of crashing
//            return null;
//        }
//    }
}