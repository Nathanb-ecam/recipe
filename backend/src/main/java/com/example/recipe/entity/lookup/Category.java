package com.example.recipe.entity.lookup;

import com.example.recipe.model.CategoryType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.NonNull;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.UUID;

@Data
@Document(collection = "categories")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Category {
    @JsonIgnore
    private String id = UUID.randomUUID().toString();
    @NonNull
    private String name;

    @NonNull
    private CategoryType type; // HEALTHY_BASED, PRICE_BASED, DIET_BASED (ex: fodmap)
    private String description;
}
