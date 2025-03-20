package com.example.recipe.models;


import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

//@Document
@Data
public class RecipeStep {
    private int stepIndex;
    private String instruction;
    private Amount duration;
}
