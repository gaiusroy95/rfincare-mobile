import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import BrandLogo from '@/src/components/BrandLogo';
import Button from '@/src/components/Button';
import Input from '@/src/components/Input';
import Screen from '@/src/components/Screen';
import { useAuth } from '@/src/contexts/AuthContext';
import { apiClient, setTokens } from '@/src/api/apiClient';
import { colors, radii } from '@/src/theme';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string) {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Include at least one uppercase letter';
  if (!/[0-9]/.test(password)) return 'Include at least one number';
  return null;
}

export default function WelcomeScreen() {
  const { signIn } = useAuth();
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
      if (pwErr) {
        Alert.alert('Weak password', pwErr);
        return;
      }
      if (!/^\d{10}$/.test(phone.replace(/\D/g, '').slice(-10))) {
        Alert.alert('Invalid phone', 'Enter a 10-digit mobile number.');
        return;
      }
      if (!fullName.trim()) {
        Alert.alert('Name required');
        return;
      }
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
        router.replace('/(customer)/eligibility');
      } catch (e: unknown) {
        Alert.alert(
          'Error',
          (e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Signup failed',
        );
      }
    } else {
      const { error } = await signIn(email.trim().toLowerCase(), password);
      if (error) Alert.alert('Login failed', error.message);
      else router.replace('/(customer)/(tabs)/dashboard');
    }
    setLoading(false);
  };

  return (
    <Screen title={mode === 'login' ? 'Customer Sign In' : 'Create Account'} scroll>
      <BrandLogo size="lg" style={styles.logo} />
      <Text style={styles.heading}>Welcome to Rfincare</Text>
      <Text style={styles.sub}>Sign in or create an account to apply for loans and track applications.</Text>

      {mode === 'signup' && (
        <>
          <Input label="Full Name" value={fullName} onChangeText={setFullName} />
          <Input
            label="Phone (10 digits)"
            value={phone}
            onChangeText={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </>
      )}

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {mode === 'signup' && (
        <Text style={styles.hint}>Min 8 chars, 1 uppercase, 1 number</Text>
      )}

      <Button
        title={mode === 'login' ? 'Sign In' : 'Create Account'}
        onPress={handleSubmit}
        loading={loading}
        variant="customer"
      />
      <Button
        title="Forgot password?"
        variant="ghost"
        onPress={() => router.push('/(customer)/forgot-password')}
        style={styles.linkBtn}
      />
      <Button
        title={mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
        variant="ghost"
        onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
        style={styles.linkBtn}
      />

      <TouchableOpacity style={styles.guestCard} onPress={() => router.push('/(customer)/(tabs)/home')} activeOpacity={0.85}>
        <Text style={styles.guestTitle}>Browse without signing in</Text>
        <Text style={styles.guestDesc}>Explore bank offers, EMI calculator, and eligibility tools</Text>
      </TouchableOpacity>

      <View style={styles.partnerSection}>
        <Text style={styles.partnerLabel}>Are you a loan agent or DSA?</Text>
        <TouchableOpacity onPress={() => router.push('/(agent)/partner')} activeOpacity={0.85}>
          <Text style={styles.partnerLink}>Become a partner →</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { alignSelf: 'center', marginBottom: 16, width: '100%' },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: 6,
  },
  sub: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  hint: { fontSize: 12, color: colors.mutedForeground, marginBottom: 12 },
  linkBtn: { marginTop: 8 },
  guestCard: {
    marginTop: 24,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  guestTitle: { fontSize: 15, fontWeight: '600', color: colors.customer },
  guestDesc: { fontSize: 13, color: colors.mutedForeground, marginTop: 4, lineHeight: 18 },
  partnerSection: {
    marginTop: 28,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  partnerLabel: { fontSize: 13, color: colors.mutedForeground, marginBottom: 6 },
  partnerLink: { fontSize: 16, fontWeight: '700', color: colors.agent },
});
