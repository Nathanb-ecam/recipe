package com.example.recipe.controller;

import com.example.recipe.dto.RecipeDto;
import com.example.recipe.dto.UserDto;
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


    @PatchMapping("/{id}/updateGrocery")
    public ResponseEntity<UserDto> updateGroceryForUserWithId(@PathVariable String id, @RequestBody @Valid UserDto updated) {
        UserDto userDto = userService.updateGroceryForUserWithId(id, updated);
        return ResponseEntity.ok(userDto);
    }

    @PatchMapping("/{id}/updateRecipesIds")
    public ResponseEntity<UserDto> updateRecipeIdsForUserWithId(@PathVariable String id, @RequestBody @Valid UserDto updated) {
        UserDto userDto = userService.updateRecipesIdsForUserWithId(id, updated);
        return ResponseEntity.ok(userDto);
    }

    @GetMapping("/{id}/saved-recipes")
    public ResponseEntity<List<RecipeDto>> getRecipesForUserWithId(@PathVariable String id) {
        List<RecipeDto> recipes = recipeService.fetchUsersRecipes(id);
        return ResponseEntity.ok(recipes);
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
