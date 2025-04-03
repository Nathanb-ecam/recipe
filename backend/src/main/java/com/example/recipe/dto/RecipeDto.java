package com.example.recipe.dto;

import com.example.recipe.model.Amount;
import com.example.recipe.model.MealType;
import com.example.recipe.model.RecipeIngredient;
import com.example.recipe.model.RecipeStep;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RecipeDto {
    private String id;
    private String name;
    private Amount duration;
    private String description;
    private boolean isPublic;
    private List<MealType> mealTypes;

    private String imageUrl;
    private List<String> categoryIds;
    private List<RecipeIngredient> ingredients;
    private List<RecipeStep> steps;
    private Amount averagePrice;
}
