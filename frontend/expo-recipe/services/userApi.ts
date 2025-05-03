import { RegisterRequest, LoginRequest, UserDto } from '../types';
import { getAccessToken } from './authUtils';
import { API_URL } from './config';

export const userApi = {
  async register(data: RegisterRequest): Promise<{ token: string; user: any }> {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    return response.json();
  },

  async login(data: LoginRequest): Promise<{ user: UserDto, accessToken: string; refreshToken: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Login request timed out. Please check your internet connection.');
        }
        throw new Error(`Login failed: ${error.message}`);
      }
      throw error;
    }
  },

  async getUserProfile(): Promise<UserDto> {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    return response.json();
  },
}; 