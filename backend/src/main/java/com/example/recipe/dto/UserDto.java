package com.example.recipe.dto;

import com.example.recipe.model.Grocery;
import com.example.recipe.model.IngredientNameWithQuantity;
import com.example.recipe.model.IngredientType;
import com.example.recipe.model.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.NonNull;

import java.util.List;
import java.util.Map;

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
    private Grocery grocery;
}
