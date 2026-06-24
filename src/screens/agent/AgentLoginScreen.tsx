import React, { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import Screen from '@/src/components/Screen';
import BrandLogo from '@/src/components/BrandLogo';
import Button from '@/src/components/Button';
import Input from '@/src/components/Input';
import { useAuth } from '@/src/contexts/AuthContext';
import { colors } from '@/src/theme';

export default function AgentLoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { data, error } = await signIn(email, password);
    if (error) {
      Alert.alert('Login failed', error.message);
    } else {
      const role = (data as { user?: { role?: string } })?.user?.role;
      if (role !== 'agent' && role !== 'admin' && role !== 'super_admin') {
        Alert.alert('Access denied', 'This login is for agents only.');
      } else {
        router.replace('/(agent)/(tabs)/dashboard');
      }
    }
    setLoading(false);
  };

  return (
    <Screen title="Agent Portal">
      <BrandLogo style={{ marginBottom: 24 }} />
      <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Sign In" onPress={handleLogin} loading={loading} variant="agent" />
      <Button title="Back to Role Selection" variant="ghost" onPress={() => router.replace('/')} style={{ marginTop: 16 }} />
    </Screen>
  );
}
