package com.example.recipe.entity.lookup;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "categories")
public class Category {
    private String id;
    private String name;
    private String description;
}
