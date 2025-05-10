package com.example.recipe.controller;

import com.example.recipe.dto.RecipeDto;
import com.example.recipe.dto.UserDto;
import com.example.recipe.model.Grocery;
import com.example.recipe.service.RecipeService;
import com.example.recipe.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {


    private final UserService userService;
    private final RecipeService recipeService;


    @GetMapping("/{id}/grocery")
    public ResponseEntity<Grocery> getGroceryForUserWithId(@PathVariable String id) {
        Grocery grocery = userService.getGroceryForUserWithId(id);
        return ResponseEntity.ok(grocery);
    }


    @PatchMapping("/{id}/grocery")
    public ResponseEntity<UserDto> updateGroceryForUserWithId(@PathVariable String id, @RequestBody @Valid Grocery updated) {
        UserDto userDto = userService.updateGroceryForUserWithId(id, updated);
        return ResponseEntity.ok(userDto);
    }

    @GetMapping("/{tenantId}/user-recipes")
    public ResponseEntity<List<RecipeDto>> fetchUsersRecipes(@PathVariable String tenantId) {
        List<RecipeDto> recipes = recipeService.fetchUsersRecipes(tenantId);
        return ResponseEntity.ok(recipes);
    }

    @PostMapping("/{tenantId}/user-recipes")
    public ResponseEntity<UserDto> addRecipeToUserRecipes(
            @PathVariable String tenantId,
            @RequestParam String recipeId
    ) {

        UserDto updatedUser = recipeService.addRecipeToUserRecipes(tenantId, recipeId);
        return ResponseEntity.ok(updatedUser);
    }


    @DeleteMapping("/{tenantId}/user-recipes")
    public ResponseEntity<UserDto> deleteRecipeOfUserRecipes(
            @PathVariable String tenantId,
            @RequestParam String recipeId
    ) {
        UserDto updatedUser = recipeService.removeRecipeOfUserRecipes(tenantId, recipeId);
        recipeService.deleteOneById(recipeId);
        return ResponseEntity.ok(updatedUser);
    }


    @GetMapping("/{tenantId}/is-saved-recipe")
    public ResponseEntity<Boolean> checkIfUserAlreadySavedRecipe(
            @PathVariable String tenantId,
            @RequestParam String recipeId
    ) {
        Boolean alreadySaved = userService.checkIfUserAlreadySavedRecipe(tenantId, recipeId);
        return ResponseEntity.ok(alreadySaved);
    }

    @GetMapping("/{tenantId}/saved-recipes")
    public ResponseEntity<List<RecipeDto>> fetchUserSavedRecipes(@PathVariable String tenantId) {
        List<RecipeDto> recipes = recipeService.fetchUsersSavedRecipes(tenantId);
        return ResponseEntity.ok(recipes);
    }

    @PostMapping("/{id}/saved-recipes")
    public ResponseEntity<UserDto> addRecipeIdToUser(
            @PathVariable String id,
            @RequestParam String recipeId
    ) {
        UserDto updatedUser = userService.addRecipeIdToUserSaved(id, recipeId);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}/saved-recipes")
    public ResponseEntity<UserDto> removeRecipeIdFromUser(
            @PathVariable String id,
            @RequestParam String recipeId
    ) {
        UserDto updatedUser = userService.removeRecipeIdFromUserSaved(id, recipeId);
        return ResponseEntity.ok(updatedUser);
    }


    @PatchMapping("/{id}/saved-recipes")
    public ResponseEntity<UserDto> updateRecipeIdsOfUser(@PathVariable String id, @RequestBody @Valid UserDto updated) {
        UserDto userDto = userService.updateRecipesIdsForUserWithId(id, updated);
        return ResponseEntity.ok(userDto);
    }



    @GetMapping("/details")
    public ResponseEntity<UserDto> getUserDetails() {
        var user = userService.getUserDetailed();
        return ResponseEntity.ok(user);
    }


    /* TODO NEED TO ADD RBAC */

    /*    @GetMapping
    public List<UserDto> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable String id) {
        Optional<UserDto> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public UserDto addUser(@RequestBody UserDto userDto) {
        return userService.addUser(userDto);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }*/
}
