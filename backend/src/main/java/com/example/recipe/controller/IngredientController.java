package com.example.recipe.controller;

import com.example.recipe.dto.RecipeDto;
import com.example.recipe.dto.lookup.IngredientDto;
import com.example.recipe.entity.lookup.Ingredient;
import com.example.recipe.exception.DatabaseException;
import com.example.recipe.exception.GenericException;
import com.example.recipe.mapper.IngredientMapper;
import com.example.recipe.repository.IngredientRepository;
import com.example.recipe.utils.FileStorageUtils;
import jakarta.validation.Valid;
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
@RequestMapping("/api/v1/ingredients")
public class IngredientController {
    private final IngredientRepository ingredientRepository;
    private final IngredientMapper ingredientMapper;

    public IngredientController(IngredientRepository ingredientRepository, IngredientMapper ingredientMapper) {
        this.ingredientRepository = ingredientRepository;
        this.ingredientMapper = ingredientMapper;
    }

    @GetMapping
    public List<Ingredient> getAllIngredients() {
        return ingredientRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ingredient> getIngredientById(@PathVariable String id) {
        Optional<Ingredient> Ingredient = ingredientRepository.findById(id);
        return Ingredient.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Ingredient addIngredient(@RequestBody Ingredient ingredient) {
        return ingredientRepository.save(ingredient);
    }

    @PostMapping(path = "/with-cover-image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Boolean addIngredientWithImage(
            @Valid @RequestPart("ingredient") IngredientDto ingredientDto,
            @RequestPart("image") MultipartFile image) {

        try{
            // Save the image and get the URL
            String imageUrl = FileStorageUtils.saveMultipartFileImage(image);

            // Set the image URL in the recipe DTO
            ingredientDto.setImageUrl(imageUrl);


            // Save the ingredient with the image URL
            Ingredient i = ingredientMapper.toEntity(ingredientDto);
            ingredientRepository.save(i);
            return Boolean.TRUE;
        }catch (Exception e){
            e.printStackTrace();
            return Boolean.FALSE;
        }

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIngredient(@PathVariable String id) {
        ingredientRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/batch")
    public ResponseEntity<List<IngredientDto>> getRecipeIngredientsById(@RequestBody List<String> ingredientsIds) {
        try {
            List<IngredientDto> ingredients = ingredientRepository
                    .findAllById(ingredientsIds)
                    .stream()
                    .map(ingredientMapper::toDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ingredients);
        } catch (DataAccessException e) {
            throw new DatabaseException("Error accessing the database");
        } catch (Exception e) {
            throw new GenericException(e.getMessage());
        }
    }

}
