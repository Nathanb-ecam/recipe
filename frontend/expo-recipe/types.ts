import { Grocery } from './types/grocery';
import { RecipeDto } from './types/recipe';

export type UserRole = 'USER' | 'ADMIN';

export type DailyMealPlan = {
  date: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  breakfastRecipe?: RecipeDto;
  lunchRecipe?: RecipeDto;
  dinnerRecipe?: RecipeDto;
}; 


// export type MealPlan = {
//   id: string;
//   userId: string;
//   meals: DailyMealPlan[];
// };


// export type MealPlanRequest = {
//   userId: string;
//   meals: DailyMealPlan[];
// };

export type UserDto = {
  id: string;
  name: string;
  mail: string;
    
  role: UserRole;
  recipesIds: string[];
  savedRecipesIds: string[];
  grocery: Grocery;
};

