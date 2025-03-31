package com.example.recipe.auth;

import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class OtpService {

    private final Random random = new Random();

    public String generateOtp() {
        return String.format("%06d", random.nextInt(1000000));
    }

    public boolean verifyOtp(String otp, String verificationCode) {
        return otp.equals(verificationCode);
    }

}
