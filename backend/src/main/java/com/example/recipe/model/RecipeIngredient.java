package com.example.recipe.model;


import lombok.Data;

import java.util.List;

@Data
public class RecipeIngredient {
    private String ingredientId;
    /*private String name;*/
    private Amount quantity;
    //private List<Price> prices;
}

