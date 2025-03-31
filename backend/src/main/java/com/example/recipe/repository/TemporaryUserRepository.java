package com.example.recipe.repository;

import com.example.recipe.entity.TemporaryUser;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TemporaryUserRepository extends MongoRepository<TemporaryUser, String> {
    Optional<TemporaryUser> findByMail(String mail);
}
