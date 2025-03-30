package com.example.recipe.mapper;

import com.example.recipe.dto.RecipeDto;
import com.example.recipe.entity.Recipe;

public class RecipeMapper {
    public static Recipe toEntity(RecipeDto recipeDto){
            Recipe recipe = new Recipe();
            if(recipeDto.getName() != null) recipe.setName(recipeDto.getName());
            if(recipeDto.getDescription() != null) recipe.setDescription(recipeDto.getDescription());
            if(recipeDto.getDuration() != null) recipe.setDuration(recipeDto.getDuration());
            if(recipeDto.getImageUrl() != null) recipe.setImageUrl(recipeDto.getImageUrl());
            if(recipeDto.getMealType() != null) recipe.setMealType(recipeDto.getMealType());
            if(recipeDto.getCategoryIds() != null) recipe.setCategoryIds(recipeDto.getCategoryIds());
            if(recipeDto.getIngredients() != null) recipe.setIngredients(recipeDto.getIngredients());
            if(recipeDto.getSteps() != null) recipe.setSteps(recipeDto.getSteps());

            return recipe;
    }

    public static RecipeDto toDto(Recipe recipe){
        RecipeDto recipeDto = new RecipeDto();
        if(recipe.getName() != null) recipeDto.setName(recipe.getName());
        if(recipe.getDescription() != null) recipeDto.setDescription(recipe.getDescription());
        if(recipe.getDuration() != null) recipeDto.setDuration(recipe.getDuration());
        if(recipe.getImageUrl() != null) recipeDto.setImageUrl(recipe.getImageUrl());
        if(recipe.getCategoryIds() != null) recipeDto.setCategoryIds(recipe.getCategoryIds());
        if(recipe.getMealType() != null) recipeDto.setMealType(recipe.getMealType());
        if(recipe.getIngredients() != null) recipeDto.setIngredients(recipe.getIngredients());
        if(recipe.getSteps() != null) recipeDto.setSteps(recipe.getSteps());

        return recipeDto;
    }
}
