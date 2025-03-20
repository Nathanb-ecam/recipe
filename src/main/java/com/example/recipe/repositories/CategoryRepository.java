package com.example.recipe.repositories;

import com.example.recipe.models.lookup.Category;
import com.example.recipe.models.lookup.Ingredient;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends MongoRepository<Category, String> {
    // Custom queries can be added here
}

