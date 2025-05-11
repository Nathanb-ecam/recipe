package com.example.recipe.dto;

import com.example.recipe.model.Grocery;
import com.example.recipe.model.Role;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDto {
    private String id;
    private String name;
    private String mail;
    //@JsonIgnore
    private String password;
    private Role role;

    private List<String> recipesIds;
    private List<String> savedRecipesIds;
    private Grocery grocery;
}
