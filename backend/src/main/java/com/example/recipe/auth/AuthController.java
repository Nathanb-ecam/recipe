package com.example.recipe.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody @Valid AuthenticationRequest authRequest) throws Exception {
        var authenticationResponse = authService.authenticate(authRequest);
        return ResponseEntity.ok(authenticationResponse);
    }


    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody @Valid RegisterRequest registerRequest) {
        var mailSent = authService.handleNewRegistration(registerRequest);
        return mailSent ?
                ResponseEntity.ok("OTP notification sent")
                : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
    }

    @PostMapping("/confirmAccount")
    public ResponseEntity<String> confirm(@RequestBody @Valid ConfirmAccountRequest request){
            var accountCreated = authService.verifyOTP(request);
            return accountCreated ?
                    ResponseEntity.ok("Account successfully created")
                    : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong, could not verify OTP");


    }

/*    @PostMapping("/signup")
    public ResponseEntity<AuthenticationResponse> signup(@RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(authService.register(registerRequest));
    }*/

    @PostMapping("/refresh")
    public void refreshToken(
        HttpServletRequest request,
        HttpServletResponse response
    ) throws IOException {
        authService.refreshToken(request, response);
    }
}
