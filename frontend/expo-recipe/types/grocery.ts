export interface Amount {
  value: number;
  unit: string;
}

export interface GroceryIngredient {
  id?: string;
ingredientName: string;
  ingredientType?: string;
  quantity?: Amount;
  alreadyBought: boolean;
}



export interface Grocery {
products: GroceryIngredient[];
  updatedAt: string;
  
} 