import { userApi } from './userApi';
import { recipeApi } from './recipeApi';
import { calendarApi } from './calendarApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { DailyMealPlan } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

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
      const response = await axios.get(`${API_URL}/users/${tenantId}/calendar/${date}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      const mealPlan = response.data;
      console.log('Initial meal plan response:', mealPlan);
      
      // Fetch recipe names for each meal if they exist
      const recipeIds = [
        mealPlan.breakfastRecipeId,
        mealPlan.lunchRecipeId,
        mealPlan.dinnerRecipeId,
      ].filter(Boolean);

      console.log('Recipe IDs to fetch:', recipeIds);

      if (recipeIds.length > 0) {
        const recipes = await this.getRecipesFromIds(recipeIds);
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
      
      if (mealPlan.breakfastRecipe?.id) {
        requestBody.breakfastRecipeId = mealPlan.breakfastRecipe.id;
      }
      if (mealPlan.lunchRecipe?.id) {
        requestBody.lunchRecipeId = mealPlan.lunchRecipe.id;
      }
      if (mealPlan.dinnerRecipe?.id) {
        requestBody.dinnerRecipeId = mealPlan.dinnerRecipe.id;
      }

      const response = await axios.put(
        `${API_URL}/users/${tenantId}/calendar`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      const tokenRefreshed = await handleApiError(error);
      if (tokenRefreshed) {
        // Retry the request with new token
        return this.updateMealPlan(date, mealPlan);
      }
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