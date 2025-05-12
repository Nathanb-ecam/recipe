package com.example.recipe.service;

import com.example.recipe.dto.RecipeDto;
import com.example.recipe.dto.RecipeWithIngredientsDetailedDto;
import com.example.recipe.dto.UserDto;
import com.example.recipe.dto.lookup.IngredientDto;
import com.example.recipe.entity.Recipe;
import com.example.recipe.entity.User;
import com.example.recipe.entity.lookup.Ingredient;
import com.example.recipe.exception.DatabaseException;
import com.example.recipe.exception.GenericException;
import com.example.recipe.exception.NoContentException;
import com.example.recipe.exception.UserIsNotTheResourceOwnerException;
import com.example.recipe.mapper.IngredientMapper;
import com.example.recipe.mapper.RecipeMapper;
import com.example.recipe.mapper.UserMapper;
import com.example.recipe.model.*;
import com.example.recipe.repository.IngredientRepository;
import com.example.recipe.repository.RecipeRepository;
import com.example.recipe.repository.UserRepository;
import com.example.recipe.utils.ReflectionUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecipeService implements CrudService<RecipeDto> {

    private final RecipeMapper recipeMapper;
    private final RecipeRepository recipeRepository;
    private final UserService userService;
    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final IngredientMapper ingredientMapper;
    private final IngredientRepository ingredientRepository;

    public void CheckIfRecipeBelongsToUser(String recipeId){
        /* TODO when RBAC is setup, an admin should be allowed to access any recipe */
        var currentUserId = userService.getCurrentUserId();
        Optional<Recipe> r = recipeRepository.findById(recipeId);
        if(r.isEmpty()) throw new NoContentException("There is no recipe with id " + recipeId);

        var tenantId = r.get().getTenantId();
        if(!tenantId.equals(currentUserId)) throw new UserIsNotTheResourceOwnerException("UserId doesnt match the resource tenantId");
    }

    public List<RecipeDto> fetchUsersRecipes(String tenantId) {
        // First, check if the user is allowed to access resources
        userService.CheckUserAllowedToAccessResource(tenantId);

        // Fetch the user entity based on tenantId
        User user = userRepository.findById(tenantId)
                .orElseThrow(() -> new UserIsNotTheResourceOwnerException("User with this tenantId doesn't exist"));

        // Get the list of recipe IDs the user has
        List<String> recipesIds = user.getRecipesIds();

        // Fetch all the recipes based on the IDs
        List<Recipe> recipes = recipeRepository.findAllById(recipesIds);

        // Filter the recipes based on the tenantId (tenantId should match the recipe's tenantId)
        List<Recipe> filteredRecipes = recipes.stream()
                .filter(recipe -> recipe.getTenantId().equals(tenantId))  // Ensure recipe's tenantId matches the provided tenantId
                .toList();

        // Map the filtered recipes to RecipeDto and return
        return filteredRecipes.stream()
                .map(recipeMapper::toDto)
                .collect(Collectors.toList());
    }


    public UserDto addRecipeToUserRecipes(String userId, String recipeId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.getRecipesIds().add(recipeId);
        userRepository.save(user);
        return userMapper.toDto(user);
    }


    public UserDto removeRecipeOfUserRecipes(String userId, String recipeId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoContentException("User not found"));

        List<String> recipes = user.getRecipesIds();
        if (recipes.contains(recipeId)) {
            recipes.remove(recipeId); // Remove by value, not index
            userRepository.save(user);
        }

        return userMapper.toDto(user);
    }


    public List<RecipeDto> fetchUsersSavedRecipes(String tenantId) {
        // First, check if the user is allowed to access resources
        userService.CheckUserAllowedToAccessResource(tenantId);

        // Fetch the user entity based on tenantId
        User user = userRepository.findById(tenantId)
                .orElseThrow(() -> new UserIsNotTheResourceOwnerException("User with this tenantId doesn't exist"));

        // Get the list of recipe IDs the user has
        List<String> recipesIds = user.getSavedRecipesIds();

        // Fetch all the recipes based on the IDs
        List<Recipe> recipes = recipeRepository.findAllById(recipesIds);

        // Filter the recipes based on the tenantId (tenantId should match the recipe's tenantId)
        List<Recipe> filteredRecipes = recipes.stream()
                .filter(recipe -> recipe.getTenantId().equals(tenantId))  // Ensure recipe's tenantId matches the provided tenantId
                .toList();

        // Map the filtered recipes to RecipeDto and return
        return filteredRecipes.stream()
                .map(recipeMapper::toDto)
                .collect(Collectors.toList());
    }


    public List<RecipeDto> getAllWithFilters(Optional<RelativePrice> relativePrice, Optional<FoodOrigin> foodOrigin, Optional<MealType> mealType, Optional<Integer> limit) {
        // Get all recipes from the database
        List<Recipe> recipes = recipeRepository.findAllByIsPublicTrue();

        // Filter by relativePrice if present
        if (relativePrice!= null && relativePrice.isPresent()) {
            recipes = recipes.stream()
                    .filter(recipe -> recipe.getRelativePrice() == relativePrice.get())
                    .collect(Collectors.toList());
        }

        // Filter by foodOrigin if present
        if (foodOrigin!= null && foodOrigin.isPresent()) {
            String origin = String.valueOf(foodOrigin.get()).toUpperCase();  // Convert to uppercase if needed
            recipes = recipes.stream()
                    .filter(recipe -> recipe.getFoodOrigins().stream()
                            .anyMatch(food -> food.name().equalsIgnoreCase(origin))) // Compare enum values
                    .collect(Collectors.toList());
        }

        // Filter by mealType if present
        if (mealType!= null && mealType.isPresent()) {
            String type = String.valueOf(mealType.get()).toUpperCase();  // Convert to uppercase if needed
            recipes = recipes.stream()
                    .filter(recipe -> recipe.getMealTypes().stream()
                            .anyMatch(meal -> meal.name().equalsIgnoreCase(type))) // Compare enum values
                    .collect(Collectors.toList());
        }

        // Apply limit if present
        Stream<Recipe> recipeStream = recipes.stream();
        if (limit.isPresent() && limit.get() > 0) {
            recipeStream = recipeStream.limit(limit.get());
        }

        return recipeStream
                .map(recipeMapper::toCompactDto)
                .collect(Collectors.toList());
    }

    public List<RecipeDto> getAll() {
        try{
            List<RecipeDto> recipes =  recipeRepository
                    .findAllByIsPublicTrue()
                    .stream()
                    .map(recipeMapper::toDto)
                    .collect(Collectors.toList());
            /*if (recipes.isEmpty()) throw new NoContentException("There are no recipes");*/
            return recipes;
        }catch(DataAccessException e){
            throw new DatabaseException("Error accessing the database");
        }
        catch (Exception e){
            throw new GenericException(e.getMessage());
        }

    }

    public List<RecipeDto> getByIds(List<String> ids) {
        try {
            List<RecipeDto> recipes = recipeRepository
                    .findAllById(ids)
                    .stream()
                    .map(recipeMapper::toDto)
                    .collect(Collectors.toList());
            if (recipes.isEmpty()) throw new NoContentException("No recipes found for the given IDs");
            return recipes;
        } catch (DataAccessException e) {
            throw new DatabaseException("Error accessing the database");
        } catch (Exception e) {
            throw new GenericException(e.getMessage());
        }
    }

    public List<RecipeDto> getCompactsByIds(List<String> ids) {
        try {
            List<RecipeDto> recipes = recipeRepository
                    .findAllById(ids)
                    .stream()
                    .map(recipeMapper::toCompactDto)
                    .collect(Collectors.toList());
            if (recipes.isEmpty()) throw new NoContentException("No recipes found for the given IDs");
            return recipes;
        } catch (DataAccessException e) {
            throw new DatabaseException("Error accessing the database");
        } catch (Exception e) {
            throw new GenericException(e.getMessage());
        }
    }


    public RecipeDto getOneById(String id) {
        var currentUserId = userService.getCurrentUserId();

        return recipeRepository
                .findByIdAndIsPublicTrue(id)
                .or(() -> recipeRepository.findByIdAndTenantId(id, currentUserId))
                .map(recipeMapper::toDto)
                .orElseThrow(() -> new UserIsNotTheResourceOwnerException("The recipe is private"))
                ;


    }

    public RecipeWithIngredientsDetailedDto getOneWithIngredientsDetailedById(String id) {
        try {
            Recipe recipe = recipeRepository.findById(id)
                    .orElseThrow(() -> new NoContentException("Recipe not found with ID: " + id));

            RecipeDto recipeDto = recipeMapper.toDto(recipe);

            // Enrich each RecipeIngredient with the full IngredientDto

            List<RecipeIngredientDetailed> enrichedIngredients = recipeDto.getIngredients().stream()
                    .map(ri -> {
                        Ingredient ingredient = ingredientRepository.findById(ri.getIngredientId())
                                .orElseThrow(() -> new NoContentException("Ingredient not found: " + ri.getIngredientId()));
                        IngredientDto ingredientDto = ingredientMapper.toDto(ingredient); // map entity to DTO

                        RecipeIngredientDetailed detailed = new RecipeIngredientDetailed();
                        detailed.setIngredient(ingredientDto);
                        detailed.setAmount(ri.getAmount());
                        return detailed;
                    })
                    .collect(Collectors.toList());

            return recipeMapper.toIngredientDetailedDto(recipeDto, enrichedIngredients);


        } catch (DataAccessException e) {
            throw new DatabaseException("Error accessing the database");
        } catch (Exception e) {
            throw new GenericException(e.getMessage());
        }
    }




/*    public Recipe updateRecipe(String id, RecipeDto recipeDto){
        try{
            Optional<Recipe> existingRecipe = recipeRepository.findById(id);
            if (existingRecipe.isEmpty()) throw new NoContentException("Recipe not found");
            var updatedEntity = recipeMapper.toEntity(recipeDto);
            updatedEntity.setId(id);
            return recipeRepository.save(updatedEntity);
        }catch (DataAccessException e){
            throw new DatabaseException("Updating recipe resulted in a database error");
        }catch (Exception e){
            throw new GenericException(e.getMessage());
        }
    }*/

    public RecipeDto updatePartiallyById(String id, RecipeDto recipeDto) {
        CheckIfRecipeBelongsToUser(id);

        Optional<Recipe> existingRecipe = recipeRepository.findById(id);
        if (existingRecipe.isEmpty()) {
            throw new NoContentException("Recipe not found");
        }

        Recipe recipeToUpdate = existingRecipe.get();
        // Using reflection to update non-null fields from recipeDto to recipeToUpdate
        ReflectionUtils.updateNonNullFields(recipeDto, recipeToUpdate);

        var recipe =  recipeRepository.save(recipeToUpdate);
        return recipeMapper.toDto(recipe);
    }

    public RecipeDto createOne(RecipeDto recipeDto) {
        if(recipeDto.getTenantId() != null){
            userService.CheckUserAllowedToAccessResource(recipeDto.getTenantId());
        }
        String id =  recipeDto.getTenantId()!= null ? recipeDto.getTenantId() : userService.getCurrentUserId();
        var recipeEntity = recipeMapper.toEntity(recipeDto);
        recipeEntity.setTenantId(id);
        var recipe = recipeRepository.save(recipeEntity);
        return recipeMapper.toDto(recipe);
    }



    public void deleteOneById(String id) {
        CheckIfRecipeBelongsToUser(id);
        recipeRepository.deleteById(id);
    }



    public List<RecipeDto> getAllCompact() {
        try{
            List<RecipeDto> recipes =  recipeRepository
                    .findAllByIsPublicTrue()
                    .stream()
                    .map(recipeMapper::toCompactDto)
                    .collect(Collectors.toList());
            /*if (recipes.isEmpty()) throw new NoContentException("There are no recipes");*/
            return recipes;
        }catch(DataAccessException e){
            throw new DatabaseException("Error accessing the database");
        }
        catch (Exception e){
            throw new GenericException(e.getMessage());
        }

    }


}

