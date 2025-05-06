package com.example.recipe.auth;

import com.example.recipe.dto.UserDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticationResponse {
    private UserDto user;
    private String accessToken;
    private String refreshToken;
}
