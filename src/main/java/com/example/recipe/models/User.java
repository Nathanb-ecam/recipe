package com.example.recipe.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection="users")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class User {
    private String username;
    private String mail;
    private String passwordHash;
    private List<String> roles;
    private List<String> recipesIds;
}
