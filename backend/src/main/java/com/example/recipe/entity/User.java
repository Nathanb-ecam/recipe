package com.example.recipe.entity;

import com.example.recipe.model.Grocery;
import com.example.recipe.model.IngredientType;
import com.example.recipe.model.IngredientNameWithQuantity;
import com.example.recipe.model.Role;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.*;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection="users")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class User implements UserDetails {
    @Id
    private String id = UUID.randomUUID().toString();
    @Getter
    private String name;
    @NotBlank
    private String mail;
    @NotBlank
    private String passwordHash;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> recipesIds = new ArrayList<>();

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> savedRecipesIds = new ArrayList<>();

    private Grocery grocery;


    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;

    private Role role;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return role.getAuthorities();
    }



    @Override
    public String getUsername(){
        return mail;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
