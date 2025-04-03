package com.example.recipe.mapper;

import com.example.recipe.dto.RecipeDto;
import com.example.recipe.entity.Recipe;

public interface IMapper<E,D> {
    E toEntity(D d);
    D toDto(E e);
}
