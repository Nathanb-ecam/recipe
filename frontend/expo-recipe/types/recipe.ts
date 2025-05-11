import { RecipeIngredient } from ".";

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER';

export type FoodOrigin = 'THAI' | 'CHINESE' | 'FRENCH' | 'ITALIAN' | 'USA' | 'SPANISH';

export type RelativePrice = 'CHEAP' | 'MODERATE' | 'EXPENSIVE' ;

export interface RecipeDto {
  id: string;
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  prepTimeMin: string;
  cookTimeMin: string;
  servings: number;
  foodOrigins?: FoodOrigin[];
  mealTypes?: MealType[];
  relativePrice?: RelativePrice;
  imageUrl?: string;
} 