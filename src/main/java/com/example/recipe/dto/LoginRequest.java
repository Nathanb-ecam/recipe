package com.example.recipe.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String mail;
    private String password;
}
