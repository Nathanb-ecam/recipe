package com.example.recipe.dto;

import lombok.Data;

@Data
public class MealEvent {
    private String hourMinString; //"12h30"
    private String recipeId;
}
