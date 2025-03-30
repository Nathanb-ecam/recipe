package com.example.recipe.entity;



import com.example.recipe.entity.lookup.Category;
import com.example.recipe.model.Amount;
import com.example.recipe.model.MealType;
import com.example.recipe.model.RecipeIngredient;
import com.example.recipe.model.RecipeStep;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
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

    private List<MealType> mealType;

    private Amount duration;
    private String averagePrice = "";
    private String description;
    private String imageUrl;
    private List<String> categoryIds;
    private List<RecipeIngredient> ingredients;
    private List<RecipeStep> steps;
    private String tenantId;
}

