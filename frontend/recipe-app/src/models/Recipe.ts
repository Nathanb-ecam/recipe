export interface Amount {
    value: number;
    unit: string;
}

export type MealType = "BREAKFAST" | "LUNCH" | "DINNER";
  
export interface RecipeIngredient {    
    ingredientId: string;
    quantity: Amount;
}
  
export interface RecipeStep {    
    instruction: string;
    duration: Amount;
}
  
export interface Recipe {
    id: string;
    name: string;
    duration: Amount;
    mealType: MealType[];
    averagePrice: string;
    description: string;
    imageUrl: string;
    categoryIds: string[];
    ingredients: RecipeIngredient[];
    steps: RecipeStep[];
    tenantId: string;
}
  