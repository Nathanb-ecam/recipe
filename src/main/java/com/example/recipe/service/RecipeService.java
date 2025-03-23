package com.example.recipe.service;

import com.example.recipe.dto.RecipeDto;
import com.example.recipe.entity.Recipe;
import com.example.recipe.exception.DatabaseException;
import com.example.recipe.exception.GenericException;
import com.example.recipe.exception.NoContentException;
import com.example.recipe.mapper.RecipeMapper;
import com.example.recipe.repository.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;

@Service
public class RecipeService {


    private final RecipeRepository recipeRepository;

    public RecipeService(RecipeRepository recipeRepository) {
        this.recipeRepository = recipeRepository;
    }

    public List<Recipe> getAllRecipes() {
        try{
            List<Recipe> recipes =  recipeRepository.findAll();
            if (recipes.isEmpty()) throw new NoContentException("There are no recipes");
            return recipes;
        }catch(DataAccessException e){
            throw new DatabaseException("Error accessing the database");
        }
        catch (Exception e){
            throw new GenericException(e.getMessage());
        }

    }

    public Optional<Recipe> getRecipeById(String id) {
        return recipeRepository.findById(id);
    }

/*    public Recipe updateRecipe(String id, RecipeDto recipeDto){
        try{
            Optional<Recipe> existingRecipe = recipeRepository.findById(id);
            if (existingRecipe.isEmpty()) throw new NoContentException("Recipe not found");
            var updatedEntity = RecipeMapper.toEntity(recipeDto);
            updatedEntity.setId(id);
            return recipeRepository.save(updatedEntity);
        }catch (DataAccessException e){
            throw new DatabaseException("Updating recipe resulted in a database error");
        }catch (Exception e){
            throw new GenericException(e.getMessage());
        }
    }*/

    public Recipe partialUpdateRecipe(String id, RecipeDto recipeDto) {
        try {
            Optional<Recipe> existingRecipe = recipeRepository.findById(id);
            if (existingRecipe.isEmpty()) {
                throw new NoContentException("Recipe not found");
            }


            Recipe recipeToUpdate = existingRecipe.get();

            // Use reflection to update non-null fields from recipeDto to recipeToUpdate
            for (Field field : RecipeDto.class.getDeclaredFields()) {
                field.setAccessible(true);

                try {
                    Object value = field.get(recipeDto);
                    if (value != null) {
                        Field targetField = Recipe.class.getDeclaredField(field.getName());
                        targetField.setAccessible(true);
                        targetField.set(recipeToUpdate, value);
                    }
                } catch (NoSuchFieldException | IllegalAccessException e) {
                    throw new GenericException(e.getMessage());
                }
            }
            return recipeRepository.save(recipeToUpdate);
        } catch (DataAccessException e) {
            throw new DatabaseException("Partial update of recipe resulted in a database error");
        } catch (Exception e) {
            throw new GenericException(e.getMessage());
        }
    }

    public Recipe addRecipe(RecipeDto recipe) {
        var recipeEntity = RecipeMapper.toEntity(recipe);
        return recipeRepository.save(recipeEntity);
    }

    public void deleteRecipe(String id) {
        recipeRepository.deleteById(id);
    }
}

