package com.example.recipe.repository;

import com.example.recipe.entity.lookup.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends MongoRepository<Category, String> {
    // Custom queries can be added here
}

