import { CalendarItem, CalendarUpdateRequest } from '../types/calendar';
import { getAccessToken } from './authUtils';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.33:8080/api/v1';

export const calendarApi = {
  async getMealPlan(date: string): Promise<CalendarItem> {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/users/${token}/calendar?date=${date}`, {
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
    return response.json();
  },

  async updateMealPlan(date: string, updateRequest: CalendarUpdateRequest): Promise<CalendarItem> {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/users/${token}/calendar`, {
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