package com.example.recipe.model;


import lombok.Data;

@Data
public class GroceryIngredient {
    private String ingredientName;
    private String ingredientType;
    private Amount quantity;
    private boolean alreadyBought;
}

