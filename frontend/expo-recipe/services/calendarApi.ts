import { CalendarItem, CalendarUpdateRequest, MealEvent } from '../types/calendar';
import { getAccessToken, getTenantId } from './authUtils';
import { recipeApi } from './recipeApi';
import { API_URL } from './config';

export const calendarApi = {
  async getMealPlan(date: string): Promise<CalendarItem> {
    const token = await getAccessToken();
    const tenantId = await getTenantId();
    const response = await fetch(`${API_URL}/users/${tenantId}/calendar/${date}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        return {
          id: '',
          date,
          mealEvents: [],
        };
      }
      throw new Error('Failed to fetch meal plan');
    }
    const calendarItem = await response.json();
    
    // Fetch recipe details for each meal event
    if (calendarItem.mealEvents?.length > 0) {
      // Sort mealEvents by hourMinString ("HH:mm")
      calendarItem.mealEvents.sort((a: MealEvent, b: MealEvent) => a.hourMinString.localeCompare(b.hourMinString));
      const recipeIds = calendarItem.mealEvents.map((event: MealEvent) => event.recipeId);
      const recipes = await recipeApi.getRecipesFromIds(recipeIds);
      
      // Map recipe names to meal events
      calendarItem.mealEvents = calendarItem.mealEvents.map((event: MealEvent) => ({
        ...event,
        recipeName: recipes.find(recipe => recipe.id === event.recipeId)?.name || 'No recipe selected'
      }));
    }
    
    return calendarItem;
  },

  async updateMealPlan(updateRequest: CalendarUpdateRequest): Promise<CalendarItem> {
    const tenantId = await getTenantId();
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/users/${tenantId}/calendar`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateRequest),
    });
    if (!response.ok) {
      throw new Error('Failed to update meal plan');
    }
    return response.json();
  },
}; 