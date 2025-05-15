import { CalendarItem, CalendarUpdateRequest, MealEvent } from '../types/calendar';
import { getAccessToken, getTenantId } from './authUtils';
import { recipeApi } from './recipeApi';
import { API_URL } from './config';
import { RecipeDto } from '@/types/recipe';

export const calendarApi = {
  async getMealPlan(date: string): Promise<CalendarItem> {
    const emptyCalendarItem: CalendarItem = {
      id: '',
      date,
      mealEvents: [],
    };

    const token = await getAccessToken();
    const tenantId = await getTenantId();
    const response = await fetch(`${API_URL}/users/${tenantId}/calendar/${date}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        return emptyCalendarItem;
      }
      throw new Error('Failed to fetch meal plan');
    }
    const calendarItem = await response.json();
    
    if (calendarItem.mealEvents?.length > 0) {
      // Filter out events with recipeIds
      const eventsWithRecipeIds = calendarItem.mealEvents.filter((event: MealEvent) => event.recipeId);
      
      if (eventsWithRecipeIds.length > 0) {
        // Get unique recipe IDs and ensure they are strings
        const recipeIds = [...new Set(eventsWithRecipeIds.map((event: MealEvent) => event.recipeId))] as string[];
        
        // Fetch recipes only if there are recipe IDs
        const recipes = await recipeApi.getRecipesFromIds(recipeIds);
        
        // Map recipe names to meal events
        calendarItem.mealEvents = calendarItem.mealEvents.map((event: MealEvent) => ({
          ...event,
          recipeName: event.recipeId 
            ? recipes.find(recipe => recipe.id === event.recipeId)?.name || 'No recipe selected'
            : event.eventName || 'No name provided',
        }));
      } else {
        // If no recipe IDs, just use event names
        calendarItem.mealEvents = calendarItem.mealEvents.map((event: MealEvent) => ({
          ...event,
          recipeName: event.eventName || 'No name provided',
        }));
      }
    }
    
    return calendarItem;
  },


  async createMealEvent(item: CalendarItem): Promise<CalendarItem> {
    const tenantId = await getTenantId();
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/users/${tenantId}/calendar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      throw new Error('Failed to create meal event');
    }
    return response.json();
  },  

  async deleteMealEvent(item: CalendarItem): Promise<CalendarItem> {
    const tenantId = await getTenantId();
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/users/${tenantId}/calendar`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      throw new Error('Failed to delete meal event');
    }
    return response.json();
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