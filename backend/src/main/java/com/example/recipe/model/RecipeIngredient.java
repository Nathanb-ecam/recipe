package com.example.recipe.model;


import com.example.recipe.dto.lookup.IngredientDto;
import lombok.Data;

import java.util.List;

@Data
public class RecipeIngredient {
    private String ingredientId;
    private Amount amount;
}

