package com.puff.tech.core.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.MacAlgorithm;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class JwtUtils {

    private JwtUtils(){}

    private static final ConcurrentHashMap<String, Instant> blacklist = new ConcurrentHashMap<>();
    private static final MacAlgorithm ALGORITHM= Jwts.SIG.HS256;
//    private static final SecretKey SECRET_KEY= ALGORITHM.key().build();
    private static final Long EXPIRATION= (long) (1000*60*60);
    private static final String keyString ="NKJNTYUIHTUYHBTGYFJBSDANIAUSD";

    private static SecretKey generateSecretKey() {
        byte[] keyBytes = JwtUtils.keyString.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            keyBytes = Arrays.copyOf(keyBytes, 32); // pads with 0s to 32 bytes
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public static String generateToken(JwtTokenInfo jwtTokenInfo){
        String jti= UUID.randomUUID().toString();

        return Jwts.builder()
                .subject(jwtTokenInfo.subject())
                .claim("enabled", jwtTokenInfo.enabled())
                .claim("permissions",jwtTokenInfo.permission())
                .claim("userId", jwtTokenInfo.userId())
                .claim("roles", jwtTokenInfo.role())
                .claim("memberId", jwtTokenInfo.memberId())
                .id(jti)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()+EXPIRATION))
                .signWith(generateSecretKey())
                .compact();
    }

    public static Boolean isTokenExpired(String token){
        try{
            Date expirationDate= Jwts.parser()
                    .verifyWith(generateSecretKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getExpiration();

            return expirationDate.before(new Date());

        }catch (JwtException e){
            return true;
        }
    }

    public static Boolean validateToken(String token , String subject){
        try{
            String extractedSubject= extractSubjectFromToken(token);
            return extractedSubject.equals(subject) && !isTokenExpired(token);

        }catch (JwtException e){
            return false;
        }
    }

   public static String extractSubjectFromToken(String token) {
        return Jwts.parser()
                .verifyWith(generateSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public static void blacklistToken(String token) {
        try {
            Claims claims = getClaims(token);
            String jti = claims.getId();
            Date exp = claims.getExpiration();
            if (jti != null && exp != null) {
                blacklist.put(jti, exp.toInstant());
            }
        } catch (JwtException ignored) {}
    }

    public static boolean isTokenBlacklisted(String jti) {
        Instant expiry = blacklist.get(jti);
        if (expiry == null) return false;

        if (expiry.isAfter(Instant.now())) return true;

        // remove expired token from blacklist
        blacklist.remove(jti);
        return false;
    }
   public static Claims getClaims(String token) throws JwtException {
        return Jwts.parser()
                .setSigningKey(generateSecretKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

}
