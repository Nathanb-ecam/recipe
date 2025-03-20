package com.example.recipe.repositories;

import com.example.recipe.models.User;
import com.example.recipe.models.lookup.Ingredient;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    // Custom queries can be added here
}

