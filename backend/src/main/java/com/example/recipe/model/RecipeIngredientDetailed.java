package com.example.recipe.model;


import com.example.recipe.dto.lookup.IngredientDto;
import lombok.Data;

@Data
public class RecipeIngredientDetailed {
    private IngredientDto ingredient;
    private Amount amount;
}

