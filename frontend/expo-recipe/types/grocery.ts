export interface Amount {
  value: number;
  unit: string;
}

export interface GroceryIngredient {
  ingredientName: string;
  ingredientType: string;
  quantity: Amount;
}

export interface Grocery {
  id: string;
  userId: string;
  products: GroceryIngredient[];
} 