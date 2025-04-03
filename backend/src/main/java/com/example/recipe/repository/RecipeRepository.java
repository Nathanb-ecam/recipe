package com.example.recipe.repository;

import com.example.recipe.entity.Recipe;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecipeRepository extends MongoRepository<Recipe, String> {
    // Custom queries can be added here

    Optional<Recipe> findByIdAndIsPublicTrue(String id); // Fetch if it's public
    Optional<Recipe> findByIdAndTenantId(String id, String tenantId);
    List<Recipe> findAllByIsPublicTrue();
}

