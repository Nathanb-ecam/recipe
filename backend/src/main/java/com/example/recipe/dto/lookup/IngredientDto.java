package com.example.recipe.dto.lookup;

import com.example.recipe.model.IngredientType;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.UUID;

@Data
public class IngredientDto {
    @Id
    private String id;
    private String name;
    private String imageUrl;
    private IngredientType type;
}
