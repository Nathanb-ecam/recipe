package com.example.recipe.model;


import lombok.Data;

@Data
public class RecipeStep {
    //private int stepIndex;
    private String instruction;
    private Amount duration;
}
