package com.example.recipe.service;

import com.example.recipe.dto.RecipeDto;

import java.util.List;
import java.util.Optional;

public interface CrudService<D> {
    List<D> getAll();
    D getOneById(String id);
    D updatePartiallyById(String id, D updatedDto);
    D createOne(D newDto);
    void deleteOneById(String id);




}
