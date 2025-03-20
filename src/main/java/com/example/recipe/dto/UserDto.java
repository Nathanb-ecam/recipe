package com.example.recipe.dto;

import lombok.Data;

import java.util.List;

@Data
public class UserDto {
    private String username;
    private String mail;
    private String password;
    private List<String> roles;
}
