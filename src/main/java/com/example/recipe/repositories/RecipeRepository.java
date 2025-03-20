package com.example.recipe.repositories;

import com.example.recipe.models.Recipe;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecipeRepository extends MongoRepository<Recipe, String> {
    // Custom queries can be added here
}

