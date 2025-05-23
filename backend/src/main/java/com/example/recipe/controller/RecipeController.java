package com.example.recipe.controller;

import com.example.recipe.dto.RecipeDto;
import com.example.recipe.dto.RecipeWithIngredientsDetailedDto;
import com.example.recipe.dto.lookup.IngredientDto;
import com.example.recipe.entity.Recipe;
import com.example.recipe.exception.DatabaseException;
import com.example.recipe.exception.GenericException;
import com.example.recipe.model.FoodOrigin;
import com.example.recipe.model.MealType;
import com.example.recipe.model.RelativePrice;
import com.example.recipe.service.RecipeService;
import com.example.recipe.service.UserService;
import com.example.recipe.utils.FileStorageUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;
    private final UserService userService;

    @PostMapping("/ideas")
    public ResponseEntity<List<String>> getIdeas(@Valid @RequestBody List<String> ingredients) {
        /* SHOULD EITHER RETURN A LIST OF RECIPE_IDS OR A LIST OF SUGGESTIONS (recipe names that are not in DB) */
        /*List<String> ingredientsList = List.of("c6a0da55-276e-4b0e-9ed9-18a3009b6ce5");*/
        List<String> ingredientsList = List.of("Tomates mozza","Caviar");
        return ResponseEntity.ok(ingredientsList);
    }

    @GetMapping("/filters")
    public ResponseEntity<List<RecipeDto>> getAllRecipesFiltered(
            @RequestParam Optional<String> relativePrice,
            @RequestParam Optional<String> foodOrigin,
            @RequestParam Optional<String> mealType,
            @RequestParam Optional<Integer> limit) {
        Optional<RelativePrice> priceEnum = relativePrice.flatMap(value -> {
            try {
                return Optional.of(RelativePrice.valueOf(value.toUpperCase()));
            } catch (IllegalArgumentException e) {
                return Optional.empty();
            }
        });

        Optional<FoodOrigin> originEnum = foodOrigin.flatMap(value -> {
            try {
                return Optional.of(FoodOrigin.valueOf(value.toUpperCase()));
            } catch (IllegalArgumentException e) {
                return Optional.empty();
            }
        });

        Optional<MealType> mealEnum = mealType.flatMap(value -> {
            try {
                return Optional.of(MealType.valueOf(value.toUpperCase()));
            } catch (IllegalArgumentException e) {
                return Optional.empty();
            }
        });
        List<RecipeDto> recipes = recipeService.getAllWithFilters(priceEnum, originEnum, mealEnum, limit);
        return ResponseEntity.ok(recipes);
    }

    @GetMapping
    public ResponseEntity<List<RecipeDto>> getAllRecipes() {
        List<RecipeDto> recipes = recipeService.getAll();
        return ResponseEntity.ok(recipes);
    }

    @PostMapping("/compact-batch")
    public ResponseEntity<List<RecipeDto>> getCompactRecipesBatch(@RequestBody @Valid List<String> recipesIds) {
        List<RecipeDto> recipes = recipeService.getCompactsByIds(recipesIds);
        return ResponseEntity.ok(recipes);
    }

    @PostMapping("/batch")
    public ResponseEntity<List<RecipeDto>> getRecipesBatch(@RequestBody @Valid List<String> recipesIds) {
        List<RecipeDto> recipes = recipeService.getByIds(recipesIds);
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/compact")
    public ResponseEntity<List<RecipeDto>> getAllRecipesCompact() {
        List<RecipeDto> recipes = recipeService.getAllCompact();
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecipeDto> getRecipeById(@PathVariable String id) {
        RecipeDto recipe = recipeService.getOneById(id);
        return ResponseEntity.ok(recipe);
    }

    @GetMapping("/{id}/ingredients-detailed")
    public ResponseEntity<RecipeWithIngredientsDetailedDto> getRecipeWithIngredientsDetailedById(@PathVariable String id) {
        RecipeWithIngredientsDetailedDto recipe = recipeService.getOneWithIngredientsDetailedById(id);
        return ResponseEntity.ok(recipe);
    }


/*    @PutMapping("/{id}")
    public ResponseEntity<Recipe> updateRecipe(@PathVariable String id, @RequestBody RecipeDto updatedRecipe) {
        Recipe recipe = recipeService.updateRecipe(id, updatedRecipe);
        return ResponseEntity.ok(recipe);
    }*/

    @PatchMapping("/{id}")
    public ResponseEntity<RecipeDto> partialUpdateRecipe(@PathVariable String id, @RequestBody RecipeDto updatedRecipe) {
        RecipeDto recipeDto = recipeService.updatePartiallyById(id, updatedRecipe);
        return ResponseEntity.ok(recipeDto);
    }
    

    @PostMapping
    public RecipeDto addRecipe(@RequestBody RecipeDto recipe) {
        return recipeService.createOne(recipe);
    }



    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable String id) {
        recipeService.deleteOneById(id);
        return ResponseEntity.noContent().build();
    }
}
