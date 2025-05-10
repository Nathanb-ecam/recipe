package com.example.recipe.dto;

import com.example.recipe.model.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
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
    /*private Amount duration;*/
    private String prepTimeMin;
    private String cookTimeMin;

    private String description;

    @JsonIgnore
    private boolean isPublic;

    private List<MealType> mealTypes; // BREAKFAST, LUNCH or DINNER
    private List<FoodOrigin> foodOrigins; // ITALIAN, FRENCH, THAI, etc

    private String imageUrl;
    private List<String> categoryIds;
    private List<RecipeIngredient> ingredients;
    /*private List<RecipeStep> steps;*/
    private List<String> steps;
    private RelativePrice relativePrice;

    private String tenantId;
}
