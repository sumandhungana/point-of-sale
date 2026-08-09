package com.puff.tech.core.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.MacAlgorithm;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class JwtUtils {

    private JwtUtils(){}

    private static final ConcurrentHashMap<String, Instant> blacklist = new ConcurrentHashMap<>();
    private static final MacAlgorithm ALGORITHM= Jwts.SIG.HS256;
    private static final SecretKey SECRET_KEY= ALGORITHM.key().build();
    private static final Long EXPIRATION= (long) (1000*60*60);

    public static String generateToken(String subject, String permission){
        String jti= UUID.randomUUID().toString();
        return Jwts.builder()
                .subject(subject)
                .claim("permission",permission)
                .setId(jti)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()+EXPIRATION))
                .signWith(SECRET_KEY)
                .compact();
    }

    public static Boolean isTokenExpired(String token){
        try{
            Date expirationDate= Jwts.parser()
                    .verifyWith(SECRET_KEY)
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
                .verifyWith(SECRET_KEY)
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
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

}
