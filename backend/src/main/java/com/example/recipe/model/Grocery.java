package com.example.recipe.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Grocery {
    private List<IngredientNameWithQuantity> meats;
    private List<IngredientNameWithQuantity> fishes;
    private List<IngredientNameWithQuantity> vegetables;
    private List<IngredientNameWithQuantity> fruits;
}
