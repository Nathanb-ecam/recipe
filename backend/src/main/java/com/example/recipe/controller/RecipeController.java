package com.example.recipe.controller;

import com.example.recipe.dto.RecipeDto;
import com.example.recipe.entity.Recipe;
import com.example.recipe.model.FoodOrigin;
import com.example.recipe.model.MealType;
import com.example.recipe.model.RelativePrice;
import com.example.recipe.service.RecipeService;
import com.example.recipe.utils.FileStorageUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;


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


    @PostMapping(path = "/with-cover-image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public RecipeDto addRecipeWithImage(
            @Valid @RequestPart("recipe") RecipeDto recipeDto,
            @RequestPart("image") MultipartFile image) {

        // Save the image and get the URL
        String imageUrl = FileStorageUtils.saveMultipartFileImage(image);

        // Set the image URL in the recipe DTO
        recipeDto.setImageUrl(imageUrl);

        // Save the recipe with the image URL
        return recipeService.createOne(recipeDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable String id) {
        recipeService.deleteOneById(id);
        return ResponseEntity.noContent().build();
    }
}
