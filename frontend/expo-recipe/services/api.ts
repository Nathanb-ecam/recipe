import { userApi } from './userApi';
import { recipeApi } from './recipeApi';
import { calendarApi } from './calendarApi';

// Export all API modules under a single namespace
export const api = {
  ...userApi,
  ...recipeApi,
  ...calendarApi,
}; 