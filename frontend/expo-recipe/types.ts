import { RecipeDto } from './types/recipe';

export type DailyMealPlan = {
  date: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  breakfastRecipe?: RecipeDto;
  lunchRecipe?: RecipeDto;
  dinnerRecipe?: RecipeDto;
}; 