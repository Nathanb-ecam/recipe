package com.example.recipe.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.Instant;
import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Grocery {
    private List<GroceryIngredient> products;

    @LastModifiedDate
    private Instant updatedAt;
}