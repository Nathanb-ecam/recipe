package com.example.recipe.auth;

import com.example.recipe.config.JwtService;
import com.example.recipe.entity.TemporaryUser;
import com.example.recipe.entity.User;
import com.example.recipe.model.Role;
import com.example.recipe.repository.TemporaryUserRepository;
import com.example.recipe.repository.UserRepository;
import com.example.recipe.service.MailService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final TemporaryUserRepository tempUserRepository;
    private final JwtService jwtService;
    private final OtpService otpService;
    private final MailService mailService;
    private final PasswordEncoder passwordEncoder;

    public AuthenticationResponse authenticate(AuthenticationRequest request) throws Exception {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getMail(),
                        request.getPassword()
                )
        );

        var user = userRepository.findByMail(request.getMail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + request.getMail()));

        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }

    public boolean handleNewRegistration(RegisterRequest request){
        // 1 generate OTP
        var otp = otpService.generateOtp();
        log.info(otp);
        // 2 create un temp user
        var username = request.getUsername();
        var mail = request.getMail();
        if (username == null || username.isEmpty()) {
            if (mail != null && mail.contains("@")) {
                username = mail.split("@")[0];
            }
        }else{
            log.error("Couldn't set username from mail");
            return false;
        }
        var tempUser = TemporaryUser.builder()
                        .username(username)
                        .mail(mail)
                        .password(passwordEncoder.encode(request.getPassword()))
                        .OTP(otp)
                        .build();
        tempUserRepository.save(tempUser);
        log.debug("Created temporary user: {}", tempUser);

        // 3 send mail containing otp request
        return mailService.sendOtpVerification(mail,otp);
    }





    public boolean verifyOTP(ConfirmAccountRequest request) throws Exception {
        var tempUser = tempUserRepository.findByMail(request.getMail())
                .orElseThrow(() -> new UsernameNotFoundException("Temporary user not found"));

        if(tempUser.getOTP().equals(request.getOtp())){
            log.debug("OTP verified");
            var user = User.builder()
                    .username(tempUser.getUsername())
                    .mail(tempUser.getMail())
                    .passwordHash(tempUser.getPassword())
                    .role(Role.USER)
                    .build();
            userRepository.save(user);
            log.debug("Created user from temporary: {}", user);
            tempUserRepository.deleteById(tempUser.getId());
            log.debug("Deleted temporary user: {}", tempUser);
            return true;
        }

        return false;
    }


    public AuthenticationResponse register(RegisterRequest request){
        var user = User.builder()
                .username(request.getUsername())
                .mail(request.getMail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();
        userRepository.save(user);
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }

    public void refreshToken(HttpServletRequest request,HttpServletResponse response) throws IOException {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        final String refreshToken;
        final String userEmail;
        if (authHeader == null ||!authHeader.startsWith("Bearer ")) {
            return;
        }
        refreshToken = authHeader.substring(7);
        userEmail = jwtService.extractUsername(refreshToken);
        if (userEmail != null) {
            var user = this.userRepository.findByMail(userEmail)
                    .orElseThrow();
            if (jwtService.isTokenValid(refreshToken, user)) {
                var accessToken = jwtService.generateToken(user);
                var authResponse = AuthenticationResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .build();
                new ObjectMapper().writeValue(response.getOutputStream(), authResponse);
            }
        }
    }

}
