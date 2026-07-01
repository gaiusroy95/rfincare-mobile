import React, { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import Screen from '@/src/components/Screen';
import Input from '@/src/components/Input';
import Button from '@/src/components/Button';
import { useAuth } from '@/src/contexts/AuthContext';

export default function AuthManagementScreen() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const { error } = await signIn(email, password);
    if (error) Alert.alert('Error', error.message);
    else router.replace('/(customer)/(tabs)/dashboard');
  };

  return (
    <Screen title="Authentication Center">
      <Button title={mode === 'login' ? 'Switch to Sign Up' : 'Switch to Login'} variant="ghost" onPress={() => setMode(mode === 'login' ? 'signup' : 'login')} />
      <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title={mode === 'login' ? 'Sign In' : 'Sign Up'} onPress={handleLogin} variant="customer" />
    </Screen>
  );
}
