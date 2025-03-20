package com.example.recipe.models.lookup;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "categories")
public class Category {
    private String id;
    private String name;
    private String description;
}
