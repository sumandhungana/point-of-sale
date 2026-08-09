package com.puff.tech.core.utils;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;

public class SecurityUtils {

    private SecurityUtils(){}

    private static final int ITERATIONS=65536;
    private static final int KEY_LENGTH=256;


    public static String hashPassword(String password) {
        byte[] salt = generateSalt();
        byte[] hash = hash(password.toCharArray(), salt);
        return Base64.getEncoder().encodeToString(salt) + ":" + Base64.getEncoder().encodeToString(hash);
    }

    public static boolean verifyPassword(String password, String stored) {
        System.out.println("Password "+ password);
        System.out.println("Stored " + stored);
        String[] parts = stored.split(":");
        if (parts.length != 2) return false;

        byte[] salt = Base64.getDecoder().decode(parts[0]);
        byte[] storedHash = Base64.getDecoder().decode(parts[1]);
        byte[] computedHash = hash(password.toCharArray(), salt);

        return constantTimeEquals(storedHash, computedHash);
    }

    private static byte[] hash(char[] password, byte[] salt) {
        try {
            PBEKeySpec spec = new PBEKeySpec(password, salt, ITERATIONS, KEY_LENGTH);
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            return factory.generateSecret(spec).getEncoded();
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new RuntimeException("Hashing error", e);
        }
    }

    public static byte[] generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[16];
        random.nextBytes(salt);
        return salt;
    }

    private static boolean constantTimeEquals(byte[] a, byte[] b) {
        if (a.length != b.length) return false;
        int result = 0;
        for (int i = 0; i < a.length; i++) {
            result |= a[i] ^ b[i];
        }
        return result == 0;
    }
}
