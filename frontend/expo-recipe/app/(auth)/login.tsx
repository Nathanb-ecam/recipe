import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { recMail, recPassword } = useLocalSearchParams();

  const handleLogin = async () => {
    try {
      await login(mail, password);
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Error', 'Failed to login. Please check your credentials.');
    }
  };

  // if (recMail && recPassword) {
  //     setMail(recMail as string);
  //     setPassword(recPassword as string);
  //     handleLogin();
  // }

  // useEffect(() => {
  //   if (recMail && recPassword) {
  //     setMail(recMail as string);
  //     setPassword(recPassword as string);
  //     handleLogin();
  //   }
  // }, [recMail, recPassword]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recipe App</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Mail"
          value={mail}
          onChangeText={setMail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <Link href="/register" asChild>
          <TouchableOpacity>
            <Text style={styles.linkText}>Don't have an account? Register</Text>
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
    gap: 20,
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