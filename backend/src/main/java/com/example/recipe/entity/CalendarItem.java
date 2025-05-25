package com.example.recipe.entity;


import com.example.recipe.dto.MealEvent;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Document(collection = "meal_plans")
@CompoundIndex(name = "unique_user_date", def = "{'userId': 1, 'date': 1}", unique = true)
@Data
public class CalendarItem {
    @Id
    private String id = UUID.randomUUID().toString();
    @JsonIgnore
    private String tenantId;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate date;

    private List<MealEvent> mealEvents;

    /*private List<String> breakfasts = new ArrayList<>(); // either the recipeId or a personalized recipeName
    private List<String> lunches = new ArrayList<>(); // either the recipeId or a personalized recipeName
    private List<String> dinners = new ArrayList<>();// either the recipeId or a personalized recipeName@*/

}