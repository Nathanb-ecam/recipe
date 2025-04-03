package com.example.recipe.controller;

import com.example.recipe.dto.RecipeDto;
import com.example.recipe.entity.Recipe;
import com.example.recipe.service.RecipeService;
import com.example.recipe.utils.FileStorageUtils;
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

    @GetMapping
    public ResponseEntity<List<RecipeDto>> getAllRecipes() {
        List<RecipeDto> recipes = recipeService.getAll();
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

    @PostMapping(path = "/with-cover-image",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public RecipeDto addRecipeWithImage(
            @RequestPart("recipe") RecipeDto recipeDto,
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
