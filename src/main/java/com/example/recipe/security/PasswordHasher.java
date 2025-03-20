package com.example.recipe.security;


import org.springframework.security.crypto.bcrypt.BCrypt;

public class PasswordHasher {
    public static String HashPassword(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt());
    }
    public static boolean verifyPasswordHash(String password, String hashedPassword) {
        return BCrypt.checkpw(password, hashedPassword);
    }
}
