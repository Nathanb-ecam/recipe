import { RegisterRequest, LoginRequest } from '../types/index';
import { UserDto } from '../types';
import { getAccessToken } from './authUtils';
import { API_URL } from './config';

export const userApi = {
  async register(data: RegisterRequest): Promise<string> {
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
    const text =  await response.text();
    console.log('Registration response:', response);    
    return text; // Assuming the response is a message string
  },

  async login(data: LoginRequest): Promise<{ user: UserDto, accessToken: string; refreshToken: string }> {
    try {
      // const controller = new AbortController();
      // const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        // signal: controller.signal,
      });

      // clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
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

  async confirmAccount(mail: string, otp: string): Promise<string> {
    const response = await fetch(`${API_URL}/auth/confirmAccount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mail, otp }),
    });
    if (!response.ok) {
      throw new Error('OTP verification failed');
    }
    return await response.text();
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