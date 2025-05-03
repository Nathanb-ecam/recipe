import { RecipeDto } from '../types/recipe';
import { getAccessToken } from './authUtils';
import { API_URL } from './config';

export const recipeApi = {
  async getCompactRecipes(): Promise<RecipeDto[]> {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/recipes/compact`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch compact recipes');
    }    
    return response.json();
  },
  
  async getRecipes(): Promise<RecipeDto[]> {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/recipes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch recipes');
    }    
    return response.json();
  },

  async getRecipesFromIds(recipesIds: string[]): Promise<RecipeDto[]> {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/recipes/compact-batch`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipesIds),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Batch request failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to fetch recipes: ${response.status} ${response.statusText}`);
    }    
    return response.json();
  },
}; 