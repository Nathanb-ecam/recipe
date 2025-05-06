export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER';

export type FoodOrigin = 'THAI' | 'CHINESE' | 'FRENCH' | 'ITALIAN' | 'USA' | 'SPANISH';

export type RelativePrice = 'CHEAP' | 'MODERATE' | 'EXPENSIVE';

export interface RecipeDto {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  duration?: {
    value: number;
    unit: string;
  };
  mealTypes: string[];
  isPublic: boolean;
  categoryIds: string[];
  ingredients: {
    name: string;
    amount: {
      value: number;
      unit: string;
    };
  }[];
  steps: {
    instruction: string;
    duration: {
      value: number;
      unit: string;
    };
  }[];
  averagePrice: {
    value: number;
    unit: string;
  };
  foodOrigins?: FoodOrigin[];
  relativePrice: RelativePrice;
} 