package com.example.recipe.dto;

import com.example.recipe.model.Amount;
import com.example.recipe.model.RecipeIngredient;
import com.example.recipe.model.RecipeStep;
import lombok.Data;

import java.util.List;

@Data
public class RecipeDto {
    private String name;
    private Amount duration;
    private String description;
    private String imageUrl;
    private List<String> categories;
    private List<RecipeIngredient> ingredients;
    private List<RecipeStep> steps;
}
