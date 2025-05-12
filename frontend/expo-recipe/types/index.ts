export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER';

export interface Amount {
  value: number;
  unit: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  // name: string;
  amount: Amount;
}





export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type UserDto = {
  id: string;
  name: string;
  email: string;
  recipesIds: string[];
};

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
//   user: UserDto;
}

export interface DailyMealPlan {
  date: string;
  eventName?: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  breakfastRecipeName?: string;
  lunchRecipeName?: string;
  dinnerRecipeName?: string;
} 