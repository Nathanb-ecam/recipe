import { RegisterRequest, LoginRequest, UserDto } from '../types';
import { getAccessToken } from './authUtils';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.33:8080/api/v1';



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
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Login failed');
    }
    return response.json();
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