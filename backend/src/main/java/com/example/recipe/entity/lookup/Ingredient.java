package com.example.recipe.entity.lookup;

import com.example.recipe.model.IngredientType;
import com.example.recipe.model.Price;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.UUID;

@Data
@Document(collection = "ingredients")
public class Ingredient {
    @Id
    private String id = UUID.randomUUID().toString();
    private String name;
    private String imageUrl;
    private IngredientType type;
    //private List<String> categories;
    //private List<Price> prices;
}
