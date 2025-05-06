package com.example.recipe.mapper;

import com.example.recipe.dto.RecipeDto;
import com.example.recipe.entity.Recipe;
import org.springframework.stereotype.Component;

@Component
public class RecipeMapper implements IMapper<Recipe, RecipeDto> {
    @Override
    public Recipe toEntity(RecipeDto recipeDto){
            Recipe recipe = new Recipe();
            if(recipeDto.getName() != null) recipe.setName(recipeDto.getName());
            if(recipeDto.getDescription() != null) recipe.setDescription(recipeDto.getDescription());
            if(recipeDto.getDuration() != null) recipe.setDuration(recipeDto.getDuration());
            recipe.setRelativePrice(recipeDto.getRelativePrice());
            recipe.setPublic(recipeDto.isPublic());
            if(recipeDto.getImageUrl() != null) recipe.setImageUrl(recipeDto.getImageUrl());
            if(recipeDto.getMealTypes() != null) recipe.setMealTypes(recipeDto.getMealTypes());
            if(recipeDto.getFoodOrigins() != null) recipe.setFoodOrigins(recipeDto.getFoodOrigins());
            if(recipeDto.getCategoryIds() != null) recipe.setCategoryIds(recipeDto.getCategoryIds());
            if(recipeDto.getIngredients() != null) recipe.setIngredients(recipeDto.getIngredients());
            if(recipeDto.getSteps() != null) recipe.setSteps(recipeDto.getSteps());

            return recipe;
    }

    @Override
    public RecipeDto toDto(Recipe recipe){
        RecipeDto recipeDto = new RecipeDto();
        recipeDto.setId(recipe.getId());
        if(recipe.getName() != null) recipeDto.setName(recipe.getName());
        if(recipe.getDescription() != null) recipeDto.setDescription(recipe.getDescription());
        recipeDto.setRelativePrice(recipe.getRelativePrice());
        recipeDto.setPublic(recipe.isPublic());
        if(recipe.getDuration() != null) recipeDto.setDuration(recipe.getDuration());
        if(recipe.getImageUrl() != null) recipeDto.setImageUrl(recipe.getImageUrl());
        if(recipe.getCategoryIds() != null) recipeDto.setCategoryIds(recipe.getCategoryIds());
        if(recipe.getMealTypes() != null) recipeDto.setMealTypes(recipe.getMealTypes());
        if(recipe.getFoodOrigins() != null) recipeDto.setFoodOrigins(recipe.getFoodOrigins());
        if(recipe.getIngredients() != null) recipeDto.setIngredients(recipe.getIngredients());
        if(recipe.getSteps() != null) recipeDto.setSteps(recipe.getSteps());

        return recipeDto;
    }


    public RecipeDto toCompactDto(Recipe recipe){
        RecipeDto recipeDto = new RecipeDto();
        recipeDto.setId(recipe.getId());
        if(recipe.getName() != null) recipeDto.setName(recipe.getName());
        if(recipe.getDescription() != null) recipeDto.setDescription(recipe.getDescription());
        recipeDto.setRelativePrice(recipe.getRelativePrice());
        if(recipe.getDuration() != null) recipeDto.setDuration(recipe.getDuration());
        if(recipe.getImageUrl() != null) recipeDto.setImageUrl(recipe.getImageUrl());
        if(recipe.getCategoryIds() != null) recipeDto.setCategoryIds(recipe.getCategoryIds());
        if(recipe.getMealTypes() != null) recipeDto.setMealTypes(recipe.getMealTypes());
        if(recipe.getFoodOrigins() != null) recipeDto.setFoodOrigins(recipe.getFoodOrigins());

        return recipeDto;
    }

}
