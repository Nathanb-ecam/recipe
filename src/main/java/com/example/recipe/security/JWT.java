package com.example.recipe.security;

import com.example.recipe.dto.UserDto;
import org.springframework.security.crypto.encrypt.RsaAlgorithm;

public class JWT {
    private RsaAlgorithm algorithm;
    private final String secret = "secret_key";



}
