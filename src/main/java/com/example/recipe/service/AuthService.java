package com.example.recipe.service;

import com.example.recipe.dto.LoginRequest;
import com.example.recipe.entity.User;
import com.example.recipe.repository.UserRepository;
import com.example.recipe.security.PasswordHasher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public boolean handleLoginRequest(LoginRequest loginRequest){
        User user = userRepository.findByMail(loginRequest.getMail()).getFirst();
        if(user == null){
            return false;
        }
        return PasswordHasher.verifyPasswordHash(loginRequest.getPassword(), user.getPasswordHash());
    }
}
