package com.example.recipe.auth;

import lombok.Data;

@Data
public class ConfirmAccountRequest {
    private String mail;
    private String otp;
}
