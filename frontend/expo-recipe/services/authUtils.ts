import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAccessToken = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) throw new Error('No access token available');
  return token;
};

export const getTenantId = async () => {
  const user = await AsyncStorage.getItem('user');
  if (!user) throw new Error('No user data available');
  return JSON.parse(user).id;
}; 