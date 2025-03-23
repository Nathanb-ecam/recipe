package com.example.recipe.controller;

import com.example.recipe.dto.RecipeDto;
import com.example.recipe.entity.Recipe;
import com.example.recipe.service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {
    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @GetMapping
    public ResponseEntity<List<Recipe>> getAllRecipes() {
        List<Recipe> recipes = recipeService.getAllRecipes();
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recipe> getRecipeById(@PathVariable String id) {
        Optional<Recipe> recipe = recipeService.getRecipeById(id);
        return recipe.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

/*    @PutMapping("/{id}")
    public ResponseEntity<Recipe> updateRecipe(@PathVariable String id, @RequestBody RecipeDto updatedRecipe) {
        Recipe recipe = recipeService.updateRecipe(id, updatedRecipe);
        return ResponseEntity.ok(recipe);
    }*/

    @PatchMapping("/{id}")
    public ResponseEntity<Recipe> partialUpdateRecipe(@PathVariable String id, @RequestBody RecipeDto updatedRecipe) {
        Recipe recipe = recipeService.partialUpdateRecipe(id, updatedRecipe);
        return ResponseEntity.ok(recipe);
    }
    
    @PostMapping
    public Recipe addRecipe(@RequestBody RecipeDto recipe) {
        return recipeService.addRecipe(recipe);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable String id) {
        recipeService.deleteRecipe(id);
        return ResponseEntity.noContent().build();
    }
}
