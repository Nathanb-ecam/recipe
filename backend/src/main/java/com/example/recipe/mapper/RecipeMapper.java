package com.example.recipe.mapper;

import com.example.recipe.dto.RecipeDto;
import com.example.recipe.dto.RecipeWithIngredientsDetailedDto;
import com.example.recipe.entity.Recipe;
import com.example.recipe.model.RecipeIngredientDetailed;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RecipeMapper implements IMapper<Recipe, RecipeDto> {
    @Override
    public Recipe toEntity(RecipeDto recipeDto){
            Recipe recipe = new Recipe();
            if(recipeDto.getName() != null) recipe.setName(recipeDto.getName());
            if(recipeDto.getDescription() != null) recipe.setDescription(recipeDto.getDescription());
            if(recipeDto.getCookTimeMin() != null) recipe.setCookTimeMin(recipeDto.getCookTimeMin());
            if(recipeDto.getPrepTimeMin() != null) recipe.setPrepTimeMin(recipeDto.getPrepTimeMin());
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
        if(recipe.getCookTimeMin() != null) recipeDto.setCookTimeMin(recipe.getCookTimeMin());
        if(recipe.getPrepTimeMin() != null) recipeDto.setPrepTimeMin(recipe.getPrepTimeMin());
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
        if(recipe.getCookTimeMin() != null) recipeDto.setCookTimeMin(recipe.getCookTimeMin());
        if(recipe.getPrepTimeMin() != null) recipeDto.setPrepTimeMin(recipe.getPrepTimeMin());
        if(recipe.getImageUrl() != null) recipeDto.setImageUrl(recipe.getImageUrl());
        if(recipe.getCategoryIds() != null) recipeDto.setCategoryIds(recipe.getCategoryIds());
        if(recipe.getMealTypes() != null) recipeDto.setMealTypes(recipe.getMealTypes());
        if(recipe.getFoodOrigins() != null) recipeDto.setFoodOrigins(recipe.getFoodOrigins());

        return recipeDto;
    }

    public RecipeWithIngredientsDetailedDto toIngredientDetailedDto(RecipeDto recipe, List<RecipeIngredientDetailed> ingredientsDetailed){
        return new RecipeWithIngredientsDetailedDto(
                recipe.getId(),
                recipe.getName(),
                recipe.getPrepTimeMin(),
                recipe.getCookTimeMin(),
                recipe.getDescription(),
                recipe.isPublic(),
                recipe.getMealTypes(),
                recipe.getFoodOrigins(),
                recipe.getImageUrl(),
                recipe.getCategoryIds(),
                ingredientsDetailed,
                recipe.getSteps(),
                recipe.getRelativePrice(),
                recipe.getTenantId()
        );
    }

}
