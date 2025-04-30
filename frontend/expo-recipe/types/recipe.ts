export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER';

export type RecipeDto = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  duration?: {
    value: number;
    unit: string;
  };
  mealTypes: MealType[];
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
}; 