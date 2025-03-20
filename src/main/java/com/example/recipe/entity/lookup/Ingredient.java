package com.example.recipe.entity.lookup;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "ingredients")
public class Ingredient {
    private String id;
    private String name;
    private List<String> categories;
}
