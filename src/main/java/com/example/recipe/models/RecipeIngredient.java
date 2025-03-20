package com.example.recipe.models;


import com.example.recipe.models.lookup.Ingredient;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

//@Document
@Data
public class RecipeIngredient {
    private String ingredientName;
    private Amount quantity;
}

