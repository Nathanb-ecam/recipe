package com.example.recipe.repository;

import com.example.recipe.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    List<User> findByMail(String mail);
    // Custom queries can be added here
}

