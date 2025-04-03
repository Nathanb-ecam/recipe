package com.example.recipe.model;

import lombok.Data;

@Data
public class IngredientNameWithQuantity {
    private String ingredientName;
    private Amount amount;
}
