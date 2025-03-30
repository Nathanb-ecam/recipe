package com.example.recipe.dto;

import com.example.recipe.model.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.NonNull;

import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDto {
    private String username;
    private String mail;
    //@JsonIgnore
    private String password;
    private Role role;
}
