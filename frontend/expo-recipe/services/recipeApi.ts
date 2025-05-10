import { RecipeDto } from '../types/recipe';
import { getAccessToken, getTenantId } from './authUtils';
import { API_URL } from './config';
import { MealType, FoodOrigin, RelativePrice } from '../types/constants';

// recipeApi is an object that contains methods for interacting with the recipe API
// It follows the singleton pattern, providing a single instance with methods for different API operations
export const recipeApi = {

    /* TODO change when endpoint is ready*/ 
    getLatestRecipes: async (): Promise<RecipeDto[]> => {
        try {
          const response = await fetch(`${API_URL}/recipes/compact`, {
            headers: {
              'Authorization': `Bearer ${await getAccessToken()}`,
            },
          });
          if (!response.ok) throw new Error('Failed to fetch recipes');
          return await response.json();
        } catch (error) {
          console.error('Error fetching compact recipes:', error);
          throw error;
        }
      },


  // Get a list of compact recipes (with minimal data)
  getCompactRecipes: async (): Promise<RecipeDto[]> => {
    try {
      const response = await fetch(`${API_URL}/recipes/compact`, {
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch recipes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching compact recipes:', error);
      throw error;
    }
  },

  // Get a list of all recipes with full details
  getRecipes: async (): Promise<RecipeDto[]> => {
    try {
      const response = await fetch(`${API_URL}/recipes`, {
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch recipes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  },

  // Get recipes by their IDs
  getRecipesFromIds: async (recipesIds: string[]): Promise<RecipeDto[]> => {
    try {
      const response = await fetch(`${API_URL}/recipes/compact-batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipesIds),
      });
      if (!response.ok) throw new Error('Failed to fetch recipes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching recipes by IDs:', error);
      throw error;
    }
  },

  // Get recipes created by a specific user
  getUserRecipes: async (): Promise<RecipeDto[]> => {
    try {
      const response = await fetch(`${API_URL}/users/${await getTenantId()}/user-recipes`, {
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch user recipes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user recipes:', error);
      throw error;
    }
  },

  addRecipeIdToUserRecipes: async (recipe: RecipeDto): Promise<RecipeDto> => {
    try {
      const response = await fetch(`${API_URL}/users/${await getTenantId()}/user-recipes?recipeId=${recipe.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipe),
      });
      if (!response.ok) throw new Error('Failed to add recipeId to user recipes');
      return await response.json();
    } catch (error) {
      console.error('Error adding recipeId to user recipes:', error);
      throw error;
    }
  },

  deleteRecipeCreatedByUser: async (recipeId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/users/${await getTenantId()}/user-recipes?recipeId=${recipeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`,  
        },
      });
      if (!response.ok) throw new Error('Failed to delete recipe');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  },


  getSavedRecipes: async (): Promise<RecipeDto[]> => {
    try {
      const response = await fetch(`${API_URL}/users/${await getTenantId()}/saved-recipes`, {
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch user recipes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user recipes:', error);
      throw error;
    }
  },

  addRecipeIdToSavedRecipes: async (recipeId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/users/${await getTenantId()}/saved-recipes?recipeId=${recipeId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeId),
      });
      if (!response.ok) throw new Error('Failed to add recipeId to saved recipes');
    } catch (error) {
      console.error('Error adding recipeId to saved recipes:', error);
      throw error;
    }
  },

  removeRecipeIdFromSaved: async (recipeId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/users/${await getTenantId()}/saved-recipes?recipeId=${recipeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to unsave recipe');
    } catch (error) {
      console.error('Error unsaving recipe:', error);
      throw error;
    }
  },

  isRecipeIdSaved: async (recipeId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/users/${await getTenantId()}/is-saved-recipe?recipeId=${recipeId}`, {
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`,
        },
      }); 
      if (!response.ok) throw new Error('Failed to check if recipeId is saved');
      return await response.json();
    } catch (error) {
      console.error('Error checking if recipeId is saved:', error);
      throw error;
    }
  },

  // Get recipes filtered by various criteria
  getFilteredRecipes: async (filters: {
    mealTypes?: MealType[];
    foodOrigins?: FoodOrigin[];
    relativePrice?: RelativePrice;
    limit?: number;
  }): Promise<RecipeDto[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.mealTypes) queryParams.append('mealTypes', filters.mealTypes.join(','));
      if (filters.foodOrigins) queryParams.append('foodOrigins', filters.foodOrigins.join(','));
      if (filters.relativePrice) queryParams.append('relativePrice', filters.relativePrice);
      if (filters.limit) queryParams.append('limit', filters.limit.toString());

      const response = await fetch(`${API_URL}/recipes/filters?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch filtered recipes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching filtered recipes:', error);
      throw error;
    }
  },

  // Create a new recipe with an image
  createRecipeWithImage: async (formData: FormData): Promise<RecipeDto> => {
    try {
      const response = await fetch(`${API_URL}/recipes/with-cover-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to create recipe');
      return await response.json();
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  },
}; 