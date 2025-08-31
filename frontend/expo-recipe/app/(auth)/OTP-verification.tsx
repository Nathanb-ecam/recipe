import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function ConfirmAccountScreen() {  
  const [otp, setOtp] = useState('');
  const [msg, setMsg] = useState('');
  const { OTPRequest } = useAuth();

  const { mail, password } = useLocalSearchParams();  

  const handleConfirmAccount = async () => {
    try {      
      const response = await OTPRequest(mail as string, otp);
      setMsg(response);
      
      if(mail && password) {
        router.replace({
          pathname: '/(auth)/login',
          params: { mail, password },
        });
      }else{
        router.replace('/(auth)/login');
      }
    } catch (error) {
      // Alert.alert('Error', error.message || 'Something went wrong.');
      setMsg('OTP Verification failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Account</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
        />
        {msg ? <Text>{msg}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleConfirmAccount}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    gap: 10,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FFD700',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
