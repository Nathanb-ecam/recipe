export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER';

export interface Amount {
  value: number;
  unit: string;
}

export interface RecipeIngredient {
  name: string;
  amount: Amount;
}

export interface RecipeStep {
  instruction: string;
  duration: Amount;
}


export interface RecipeDto {
  id: string;
  name: string;
  // duration: Amount;
  cookTimeMin: string;
  prepTimeMin: string;
  description: string;
  isPublic: boolean;
  mealTypes: MealType[];
  imageUrl: string;
  categoryIds: string[];
  // ingredients: RecipeIngredient[];  
  // steps: RecipeStep[];
  steps: string[];
  averagePrice: Amount;
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
  breakfast: string;
  lunch: string;
  dinner: string;
  breakfastRecipeName?: string;
  lunchRecipeName?: string;
  dinnerRecipeName?: string;
} 