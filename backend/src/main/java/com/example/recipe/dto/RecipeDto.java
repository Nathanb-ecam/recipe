package com.example.recipe.dto;

import com.example.recipe.entity.lookup.Category;
import com.example.recipe.model.Amount;
import com.example.recipe.model.MealType;
import com.example.recipe.model.RecipeIngredient;
import com.example.recipe.model.RecipeStep;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeDto {
    private String name;
    private Amount duration;
    private String description;
    private List<MealType> mealType;
    private String imageUrl;
    private List<String> categoryIds;
    private List<RecipeIngredient> ingredients;
    private List<RecipeStep> steps;
    private String averagePrice = "";
}
