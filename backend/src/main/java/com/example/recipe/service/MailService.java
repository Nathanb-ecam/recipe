package com.example.recipe.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {


    private final JavaMailSender mailSender;

    public boolean sendOtpVerification(String to, String otp) {
        try{
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(to);
            mail.setSubject("Confirm your account");
            mail.setText("OTP verification email: " + otp);
            mailSender.send(mail);
            return true;
        }catch (Exception e){
            log.error(e.getMessage());
            return false;
        }
    }
}
