package com.example.recipe.dto;

import com.example.recipe.model.MealType;
import lombok.Data;

@Data
public class MealEvent {
    /*private String hourMinString; //"12h30"*/
    private MealType mealType; // LUNCH, BREAKFAST OR DINNER
    private String eventName; // if the user doesn't need to attach a specific recipe, he can simply set a name
    private String recipeId;
}
