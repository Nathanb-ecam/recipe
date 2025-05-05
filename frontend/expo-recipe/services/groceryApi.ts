import { Grocery, IngredientNameWithQuantity } from '../types/grocery';
import { getAccessToken, getTenantId } from './authUtils';
import { API_URL } from './config';

export const groceryApi = {
  async getGroceryList(): Promise<Grocery> {
    const token = await getAccessToken();
    const tenantId = await getTenantId();
    const response = await fetch(`${API_URL}/users/${tenantId}/grocery`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch grocery list');
    }
    return response.json();
  },

  async updateGroceryList(products: IngredientNameWithQuantity[]): Promise<Grocery> {
    const token = await getAccessToken();
    const tenantId = await getTenantId();
    const response = await fetch(`${API_URL}/users/${tenantId}/grocery`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ products }),
    });
    if (!response.ok) {
      throw new Error('Failed to update grocery list');
    }
    return response.json();
  },
}; 