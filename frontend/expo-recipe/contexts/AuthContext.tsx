import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { UserDto } from '../types';
import { router } from 'expo-router';

interface AuthContextType {
  user: UserDto | null;
  token: {accessToken:string,refreshToken:string} | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [token, setToken] = useState<{accessToken:string,refreshToken:string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const validateToken = async (accessToken: string) => {
    try {
      // Try to fetch user profile to validate token
      const userData = await api.getUserProfile();
      return true;
    } catch (error: any) {
      console.error('Token validation error:', error);
      if (error.message?.includes('403')) {
        // Token is invalid or expired
        await logout();
        router.replace('/(auth)/login');
        return false;
      }
      throw error;
    }
  };

  useEffect(() => {
    loadStoredCredentials();
  }, []);

  const loadStoredCredentials = async () => {
    try {
      const storedAccessToken = await AsyncStorage.getItem('accessToken');
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedAccessToken && storedRefreshToken) {
        // Validate the token before using it
        const isValid = await validateToken(storedAccessToken);
        if (!isValid) {
          return;
        }

        setToken({
          accessToken: storedAccessToken,
          refreshToken: storedRefreshToken
        });
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // If we have tokens but no user, fetch user data
          const userData = await api.getUserProfile();
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error loading stored credentials:', error);
      // If there's an error, clear stored credentials
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { accessToken, refreshToken, user } = await api.login({ mail: email, password });
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setToken({"accessToken":accessToken,"refreshToken":refreshToken});                  
      setUser(user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // const { token, user } = await api.register({ name, mail: email, password });
      // await AsyncStorage.setItem('accessToken', accessToken);
      // await AsyncStorage.setItem('refreshToken', refreshToken);
      // await AsyncStorage.setItem('user', JSON.stringify(user));
      // setToken(token);
      // setUser(user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 