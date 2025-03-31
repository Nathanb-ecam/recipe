package com.example.recipe.entity.lookup;

import com.example.recipe.model.Price;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "ingredients")
public class Ingredient {
    @Id
    private String id;
    private String name;
    private List<String> categories;
    //private List<Price> prices;
}
