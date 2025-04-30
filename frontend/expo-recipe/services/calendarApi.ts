import { DailyMealPlan } from '../types';
import { RecipeDto } from '../types/recipe';
import { getAccessToken, getTenantId } from './authUtils';
import { recipeApi } from './recipeApi';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.33:8080/api/v1';

export const calendarApi = {
  async getMealPlan(date: string): Promise<DailyMealPlan> {
    const [token, tenantId] = await Promise.all([getAccessToken(), getTenantId()]);
    const response = await fetch(`${API_URL}/users/${tenantId}/calendar/${date}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Return empty meal plan if no calendar item exists
        return {
          date,
          breakfast: '',
          lunch: '',
          dinner: '',
        };
      }
    throw new Error(`Failed to fetch meal plan: ${response.status} ${response.statusText}`);
      
    }

    const calendarItem = await response.json();
    
    // Fetch recipe details for each meal
    const recipeIds = [
      calendarItem.breakfastRecipeId,
      calendarItem.lunchRecipeId,
      calendarItem.dinnerRecipeId,
    ].filter(Boolean);

    let recipes: RecipeDto[] = [];
    if (recipeIds.length > 0) {
      recipes = await recipeApi.getRecipesFromIds(recipeIds);
    }

    return {
      date,
      breakfast: calendarItem.breakfastRecipeId || '',
      lunch: calendarItem.lunchRecipeId || '',
      dinner: calendarItem.dinnerRecipeId || '',
      breakfastRecipe: recipes.find(r => r.id === calendarItem.breakfastRecipeId),
      lunchRecipe: recipes.find(r => r.id === calendarItem.lunchRecipeId),
      dinnerRecipe: recipes.find(r => r.id === calendarItem.dinnerRecipeId),
    };
  },

  async getAllCalendarItems(): Promise<DailyMealPlan[]> {
    const [token, tenantId] = await Promise.all([getAccessToken(), getTenantId()]);
    const response = await fetch(`${API_URL}/users/${tenantId}/calendar`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch calendar items: ${response.statusText}`);
    }

    const calendarItems = await response.json();
    
    // Fetch all unique recipe IDs
    const recipeIds = new Set<string>();
    calendarItems.forEach((item: any) => {
      if (item.breakfastRecipeId) recipeIds.add(item.breakfastRecipeId);
      if (item.lunchRecipeId) recipeIds.add(item.lunchRecipeId);
      if (item.dinnerRecipeId) recipeIds.add(item.dinnerRecipeId);
    });

    let recipes: RecipeDto[] = [];
    if (recipeIds.size > 0) {
      recipes = await recipeApi.getRecipesFromIds(Array.from(recipeIds));
    }

    return calendarItems.map((item: any) => ({
      date: item.date,
      breakfast: item.breakfastRecipeId || '',
      lunch: item.lunchRecipeId || '',
      dinner: item.dinnerRecipeId || '',
      breakfastRecipe: recipes.find(r => r.id === item.breakfastRecipeId),
      lunchRecipe: recipes.find(r => r.id === item.lunchRecipeId),
      dinnerRecipe: recipes.find(r => r.id === item.dinnerRecipeId),
    }));
  },

  async updateMealPlan(date: string, mealPlan: DailyMealPlan): Promise<void> {
    const [token, tenantId] = await Promise.all([getAccessToken(), getTenantId()]);
    

    const response = await fetch(`${API_URL}/users/${tenantId}/calendar`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date,
        breakfastRecipeId: mealPlan.breakfast || null,
        lunchRecipeId: mealPlan.lunch || null,
        dinnerRecipeId: mealPlan.dinner || null,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
    //   console.error('Failed to update meal plan:', {
    //     status: response.status,
    //     statusText: response.statusText,
    //     error: errorText,
    //     requestBody: {
    //       date,
    //       breakfastRecipeId: mealPlan.breakfast || null,
    //       lunchRecipeId: mealPlan.lunch || null,
    //       dinnerRecipeId: mealPlan.dinner || null,
    //     }
    //   });
      throw new Error(`Failed to update meal plan: ${response.status} ${response.statusText}`);
    }
  },
}; 