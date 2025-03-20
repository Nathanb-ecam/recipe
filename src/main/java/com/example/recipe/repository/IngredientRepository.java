package com.example.recipe.repository;

import com.example.recipe.entity.lookup.Ingredient;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IngredientRepository extends MongoRepository<Ingredient, String> {
    // Custom queries can be added here
}

