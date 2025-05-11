import { userApi } from './userApi';
import { recipeApi } from './recipeApi';
import { calendarApi } from './calendarApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyMealPlan } from '../types';
import { API_URL } from './config';
import { RecipeDto } from '../types/recipe';

// Export all API modules under a single namespace
export const api = {
  ...userApi,
  ...recipeApi,
  ...calendarApi,

  async getMealPlan(date: string): Promise<DailyMealPlan> {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const user = await AsyncStorage.getItem('user');
      const tenantId = user ? JSON.parse(user).id : null;
      const response = await calendarApi.getMealPlan(date);
      
      const mealPlan = response;
      console.log('Initial meal plan response:', mealPlan);
      
      // Fetch recipe names for each meal if they exist
      const recipeIds = [
        mealPlan.breakfastRecipeId,
        mealPlan.lunchRecipeId,
        mealPlan.dinnerRecipeId,
      ].filter(Boolean);

      console.log('Recipe IDs to fetch:', recipeIds);

      if (recipeIds.length > 0) {
        const recipes = await recipeApi.getRecipesFromIds(recipeIds);
        console.log('Fetched recipes:', recipes);
        
        if (mealPlan.breakfastRecipeId) {
          const breakfastRecipe = recipes.find(r => r.id === mealPlan.breakfastRecipeId);
          console.log('Found breakfast recipe:', breakfastRecipe);
          mealPlan.breakfast = mealPlan.breakfastRecipeId;
          mealPlan.breakfastRecipeName = breakfastRecipe?.name;
        }
        if (mealPlan.lunchRecipeId) {
          const lunchRecipe = recipes.find(r => r.id === mealPlan.lunchRecipeId);
          console.log('Found lunch recipe:', lunchRecipe);
          mealPlan.lunch = mealPlan.lunchRecipeId;
          mealPlan.lunchRecipeName = lunchRecipe?.name;
        }
        if (mealPlan.dinnerRecipeId) {
          const dinnerRecipe = recipes.find(r => r.id === mealPlan.dinnerRecipeId);
          console.log('Found dinner recipe:', dinnerRecipe);
          mealPlan.dinner = mealPlan.dinnerRecipeId;
          mealPlan.dinnerRecipeName = dinnerRecipe?.name;
        }
      }
      
      console.log('Final meal plan with names:', mealPlan);
      return mealPlan;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Return empty meal plan for dates that don't exist yet
        return {
          date,
          breakfast: '',
          lunch: '',
          dinner: '',
        };
      }
      const tokenRefreshed = await handleApiError(error);
      if (tokenRefreshed) {
        // Retry the request with new token
        return this.getMealPlan(date);
      }
      throw error;
    }
  },

  async updateMealPlan(date: string, mealPlan: DailyMealPlan): Promise<void> {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const user = await AsyncStorage.getItem('user');
      const tenantId = user ? JSON.parse(user).id : null;
      
      const requestBody: any = { date };
      
      if (mealPlan.breakfastRecipeId) {
        requestBody.breakfastRecipeId = mealPlan.breakfastRecipeId;
      }
      if (mealPlan.lunchRecipeId) {
        requestBody.lunchRecipeId = mealPlan.lunchRecipeId;
      }
      if (mealPlan.dinnerRecipeId) {
        requestBody.dinnerRecipeId = mealPlan.dinnerRecipeId;
      }

      await calendarApi.updateMealPlan(date, requestBody);
    } catch (error: any) {
      const tokenRefreshed = await handleApiError(error);
      if (tokenRefreshed) {
        // Retry the request with new token
        return this.updateMealPlan(date, mealPlan);
      }
      throw error;
    }
  },

  async getRecipeIdeas(ingredients: string[]): Promise<string[]> {
    
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/recipes/ideas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ingredients),
      });
      console.log('Recipe ideas response:', response);
      return await response.json();
    } catch (error) {
      console.error('Error getting recipe ideas:', error);
      throw error;
    }
  },

};

const handleApiError = async (error: any) => {
  if (error.response?.status === 403) {
    try {
      const email = await AsyncStorage.getItem('email');
      const password = await AsyncStorage.getItem('password');
      
      if (email && password) {
        const response = await userApi.login({ email, password });
        await AsyncStorage.setItem('accessToken', response.accessToken);
        return true; // Token refreshed successfully
      }
    } catch (refreshError) {
      console.error('Error refreshing token:', refreshError);
    }
  }
  return false; // Token refresh failed or not needed
}; 