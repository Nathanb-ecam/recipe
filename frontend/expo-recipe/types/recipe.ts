export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER';

export type FoodOrigin = 'THAI' | 'CHINESE' | 'FRENCH' | 'ITALIAN' | 'USA' | 'SPANISH';

export type RelativePrice = 'CHEAP' | 'MODERATE' | 'EXPENSIVE' ;

// export type IngredientType = 'FRUIT' | 'VEGETABLE' | 'FISH' | 'MEAT' | 'CARB' | 'SPICE' | 'DAIRY' | 'LEGUME' | 'NUT' | 'HERB' | 'CONDIMENT' | 'SWEETENER' | 'OIL' | 'BEVERAGE';
export const INGREDIENT_TYPES = [
  'FRUIT', 'VEGETABLE', 'FISH', 'MEAT', 'CARB', 'SPICE', 'DAIRY', 'LEGUME',
  'NUT', 'HERB', 'CONDIMENT', 'SWEETENER', 'OIL', 'BEVERAGE'
] as const;

export type IngredientType = typeof INGREDIENT_TYPES[number];


export interface IngredientDto {
  id: string;
  name: string;
  imageUrl?: string;
  type: IngredientType;
}

export interface RecipeIngredient {
  ingredientId: string;
  amount: {
    value: number;
    unit: string;
  };
}

export interface RecipeDto {
  id: string;
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  prepTimeMin: number;
  cookTimeMin: number;
  servings: number;
  foodOrigins?: FoodOrigin[];
  mealTypes?: MealType[];
  relativePrice?: RelativePrice;
  imageUrl?: string;
} 