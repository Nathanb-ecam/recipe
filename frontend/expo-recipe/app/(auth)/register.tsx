import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterScreen() {
  const [registerData, setRegisterData] = useState({
    name: '', 
    mail: '', 
    password: ''
  });
  const [msg, setMsg] = useState('');
  const { register } = useAuth();

  const handleRegister = async () => {
    try {
      const { name, mail, password } = registerData;
      const msg = await register(name, mail, password);
      setMsg(msg);
      router.replace({
        pathname: '/(auth)/OTP-verification',
        params: { mail },
      });
 
    } catch (error) {
      Alert.alert('Error', 'Failed to register. Please try again.');
      setMsg('Registration failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={registerData.name}
          onChangeText={(text) => setRegisterData({ ...registerData, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Mail"
          value={registerData.mail}
          onChangeText={(text) => setRegisterData({ ...registerData, mail: text })}                  
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={registerData.password}
          onChangeText={(text) => setRegisterData({ ...registerData, password: text })}
          secureTextEntry
        />
        <Text>{msg}</Text>
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
        <Link href="/login" asChild>
          <TouchableOpacity>
            <Text style={styles.linkText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </Link>
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
  linkText: {
    color: '#FFD700',
    textAlign: 'center',
    marginTop: 20,
  },
}); 