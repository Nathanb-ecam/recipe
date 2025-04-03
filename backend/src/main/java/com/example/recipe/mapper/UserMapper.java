package com.example.recipe.mapper;

import com.example.recipe.dto.UserDto;
import com.example.recipe.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper implements IMapper<User, UserDto> {
    public User toEntity(UserDto userDto, String passwordHash) {
        User user = new User();
        user.setName(userDto.getName());
        user.setMail(userDto.getMail());
        user.setPasswordHash(passwordHash);
        user.setRole(userDto.getRole());
        user.setGrocery(userDto.getGrocery());
        user.setRecipesIds(userDto.getRecipesIds());
        return user;
    }

    @Override
    public User toEntity(UserDto userDto) {
        return null;
    }

    @Override
    public UserDto toDto(User user) {
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setName(user.getName());
        userDto.setMail(user.getMail());
        userDto.setRole(user.getRole());
        userDto.setGrocery(user.getGrocery());
        userDto.setRecipesIds(user.getRecipesIds());
        return userDto;
    }
}