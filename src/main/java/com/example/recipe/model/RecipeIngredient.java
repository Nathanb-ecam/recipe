package com.example.recipe.model;


import lombok.Data;

@Data
public class RecipeIngredient {
    private String ingredientName;
    private Amount quantity;
}

