import React, { useState, useEffect } from 'react';

import { Alert, Text } from 'react-native';

import { router } from 'expo-router';

import Screen from '@/src/components/Screen';

import BrandLogo from '@/src/components/BrandLogo';

import Button from '@/src/components/Button';

import Input from '@/src/components/Input';

import { useAuth } from '@/src/contexts/AuthContext';

import { apiClient, setTokens } from '@/src/api/apiClient';



function validateEmail(email: string) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}



function validatePassword(password: string) {

  if (password.length < 8) return 'Password must be at least 8 characters';

  if (!/[A-Z]/.test(password)) return 'Include at least one uppercase letter';

  if (!/[0-9]/.test(password)) return 'Include at least one number';

  return null;

}



export default function CustomerLoginScreen() {

  const { signIn, user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/(customer)/(tabs)/dashboard');
    }
  }, [authLoading, user]);

  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [fullName, setFullName] = useState('');

  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);



  const handleSubmit = async () => {

    if (!validateEmail(email)) {

      Alert.alert('Invalid email', 'Enter a valid email address.');

      return;

    }

    if (mode === 'signup') {

      const pwErr = validatePassword(password);

      if (pwErr) { Alert.alert('Weak password', pwErr); return; }

      if (!/^\d{10}$/.test(phone.replace(/\D/g, '').slice(-10))) {

        Alert.alert('Invalid phone', 'Enter a 10-digit mobile number.');

        return;

      }

      if (!fullName.trim()) { Alert.alert('Name required'); return; }

    }



    setLoading(true);

    if (mode === 'signup') {

      try {

        const res = await apiClient.post('/auth/signup', {

          email: email.trim().toLowerCase(),

          password,

          fullName: fullName.trim(),

          phone: phone.replace(/\D/g, '').slice(-10),

          role: 'customer',

        });

        await setTokens(res.data?.accessToken, res.data?.refreshToken);

        router.replace('/(customer)/assessment');

      } catch (e: unknown) {

        Alert.alert('Error', (e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Signup failed');

      }

    } else {

      const { error } = await signIn(email.trim().toLowerCase(), password);

      if (error) Alert.alert('Login failed', error.message);

      else router.replace('/(customer)/(tabs)/dashboard');

    }

    setLoading(false);

  };



  return (

    <Screen title={mode === 'login' ? 'Customer Sign In' : 'Create Account'}>

      <BrandLogo style={{ marginBottom: 24 }} />

      {mode === 'signup' && (

        <>

          <Input label="Full Name" value={fullName} onChangeText={setFullName} />

          <Input label="Phone (10 digits)" value={phone} onChangeText={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))} keyboardType="phone-pad" maxLength={10} />

        </>

      )}

      <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

      <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />

      {mode === 'signup' && <Text style={{ fontSize: 12, color: '#4A5568', marginBottom: 12 }}>Min 8 chars, 1 uppercase, 1 number</Text>}

      <Button title={mode === 'login' ? 'Sign In' : 'Create Account'} onPress={handleSubmit} loading={loading} variant="customer" />

      <Button title="Forgot password?" variant="ghost" onPress={() => router.push('/(customer)/forgot-password')} style={{ marginTop: 8 }} />

      <Button title={mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'} variant="ghost" onPress={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ marginTop: 8 }} />

      <Button title="Back to Home" variant="ghost" onPress={() => router.back()} style={{ marginTop: 16 }} />

    </Screen>

  );

}


