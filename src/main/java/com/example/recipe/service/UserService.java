package com.example.recipe.service;

import com.example.recipe.dto.LoginRequest;
import com.example.recipe.dto.UserDto;
import com.example.recipe.entity.User;
import com.example.recipe.exception.DatabaseException;
import com.example.recipe.exception.GenericException;
import com.example.recipe.exception.NoContentException;
import com.example.recipe.mapper.UserMapper;
import com.example.recipe.repository.UserRepository;
import com.example.recipe.security.PasswordHasher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<UserDto> getAllUsers() {
        try{
            List<UserDto> users =  userRepository
                    .findAll()
                    .stream()
                    .map(UserMapper::toDto)
                    .collect(Collectors.toList());
            if (users.isEmpty()) throw new NoContentException("No users found");
            return users;
        }catch(DataAccessException e){
            throw new DatabaseException("Trying to access users resulted in a database error");
        }catch(Exception e){
            throw new GenericException(e.getMessage());
        }

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

