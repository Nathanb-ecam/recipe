package com.example.recipe.entity;



import com.example.recipe.model.Amount;
import com.example.recipe.model.RecipeIngredient;
import com.example.recipe.model.RecipeStep;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;




@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Document(collection = "recipes")
public class Recipe {
    @Id
    private String id;
    private String name;
    private Amount duration;
    private String description;
    private String imageUrl;
    private List<String> categories;
    private List<RecipeIngredient> ingredients;
    private List<RecipeStep> steps;
}

