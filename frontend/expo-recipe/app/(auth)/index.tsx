import { Redirect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthIndex() {
  const { token } = useAuth();
  
  // If user is not authenticated, redirect to login
  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }
  
  // If user is authenticated, redirect to tabs
  return <Redirect href="/(tabs)/recipes" />;
} 