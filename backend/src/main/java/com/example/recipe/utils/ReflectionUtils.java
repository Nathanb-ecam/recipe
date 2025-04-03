package com.example.recipe.utils;

import com.example.recipe.dto.RecipeDto;
import com.example.recipe.entity.Recipe;
import com.example.recipe.exception.GenericException;

import java.lang.reflect.Field;

public class ReflectionUtils {
    public static <S,T>  void updateNonNullFields(S sourceDto, T targetEntity){
        // Using reflection to update non-null fields from a sourceDto to an targetEntity
        for (Field field : sourceDto.getClass().getDeclaredFields()) {
            field.setAccessible(true);
            try {
                Object value = field.get(sourceDto);
                if (value != null) {
                    Field targetField = targetEntity.getClass().getDeclaredField(field.getName());
                    targetField.setAccessible(true);
                    targetField.set(targetEntity, value);
                }
            } catch (NoSuchFieldException | IllegalAccessException e) {
                throw new GenericException("Partial update failed, field could not be parsed");
            }
        }
    }
}

