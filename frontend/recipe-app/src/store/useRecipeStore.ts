import { create } from "zustand";
import axios from "axios";
import { Recipe } from "../models/Recipe";


// Define store state & actions
interface RecipeState {
  recipes: Recipe[];
  fetchRecipes: () => Promise<void>;
  addRecipe: (recipe: Recipe) => Promise<void>;
  updateRecipe: (id: string, updatedRecipe: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
}

// API base URL (replace with your actual backend URL)
const API_URL = "https://your-api.com/recipes";

export const useRecipeStore = create<RecipeState>((set) => ({
  recipes: [],

  // Fetch recipes
  fetchRecipes: async () => {
    try {
      const { data } = await axios.get<Recipe[]>(API_URL);
      set({ recipes: data });
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  },

  // Add a new recipe
  addRecipe: async (recipe) => {
    try {
      const { data } = await axios.post<Recipe>(API_URL, recipe);
      set((state) => ({ recipes: [...state.recipes, data] }));
    } catch (error) {
      console.error("Error adding recipe:", error);
    }
  },

  // Update an existing recipe (Partial Update using PATCH)
  updateRecipe: async (id, updatedRecipe) => {
    try {
      const { data } = await axios.patch<Recipe>(`${API_URL}/${id}`, updatedRecipe);
      set((state) => ({
        recipes: state.recipes.map((recipe) => (recipe.id === id ? { ...recipe, ...data } : recipe)),
      }));
    } catch (error) {
      console.error("Error updating recipe:", error);
    }
  },

  // Delete a recipe
  deleteRecipe: async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      set((state) => ({
        recipes: state.recipes.filter((recipe) => recipe.id !== id),
      }));
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  },
}));
