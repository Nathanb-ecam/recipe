package com.example.recipe.service;

import com.example.recipe.dto.LoginRequest;
import com.example.recipe.dto.UserDto;
import com.example.recipe.entity.User;
import com.example.recipe.mapper.UserMapper;
import com.example.recipe.repository.UserRepository;
import com.example.recipe.security.PasswordHasher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<UserDto> getAllUsers() {
        return userRepository
                .findAll()
                .stream()
                .map(UserMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<UserDto> getUserById(String id) {

        return userRepository
                .findById(id)
                .map(UserMapper::toDto);
    }

    public UserDto addUser(UserDto userDto) {
        String passwordHash = PasswordHasher.HashPassword(userDto.getPassword());
        User user = UserMapper.toEntity(userDto, passwordHash);
        userRepository.save(user);
        return userDto;
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
}

