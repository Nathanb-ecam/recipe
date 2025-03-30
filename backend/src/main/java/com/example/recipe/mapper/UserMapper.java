package com.example.recipe.mapper;

import com.example.recipe.dto.UserDto;
import com.example.recipe.entity.User;

public class UserMapper {
    public static User toEntity(UserDto userDto, String passwordHash) {
        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setMail(userDto.getMail());
        user.setPasswordHash(passwordHash);
        user.setRole(userDto.getRole());
        return user;
    }

    public static UserDto toDto(User user) {
        UserDto userDto = new UserDto();
        userDto.setUsername(user.getUsername());
        userDto.setMail(user.getMail());
        userDto.setRole(user.getRole());
        return userDto;
    }
}