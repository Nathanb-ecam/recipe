export interface MealEvent {
  // hourMinString: string;
  mealType: string;
  recipeId: string;
  eventName?: string;
  recipeName?: string;
}

export interface CalendarItem {
  id: string;
  date: string;
  mealEvents: MealEvent[];
}

export interface CalendarUpdateRequest {
  date: string;
  mealEvents: MealEvent[];
} 