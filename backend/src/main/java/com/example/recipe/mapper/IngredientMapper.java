package com.example.recipe.mapper;

import com.example.recipe.dto.RecipeDto;
import com.example.recipe.dto.lookup.IngredientDto;
import com.example.recipe.entity.Recipe;
import com.example.recipe.entity.lookup.Ingredient;
import org.springframework.stereotype.Component;

@Component
public class IngredientMapper implements IMapper<Ingredient, IngredientDto> {
    @Override
    public Ingredient toEntity(IngredientDto ingredientDto){
           Ingredient ingredient = new Ingredient();
           ingredient.setName(ingredientDto.getName());
           ingredient.setImageUrl(ingredientDto.getImageUrl());
           ingredient.setType(ingredientDto.getType());
           return ingredient;
    }

    @Override
    public IngredientDto toDto(Ingredient ingredient) {
        IngredientDto ingredientDto = new IngredientDto();
        ingredientDto.setId(ingredient.getId());
        ingredientDto.setName(ingredient.getName());
        ingredientDto.setImageUrl(ingredient.getImageUrl());
        ingredientDto.setType(ingredient.getType());
        return ingredientDto;
    }



}
