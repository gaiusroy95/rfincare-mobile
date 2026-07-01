import React, { useState } from 'react';
import { Alert, Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import Screen from '@/src/components/Screen';
import BrandLogo from '@/src/components/BrandLogo';
import Button from '@/src/components/Button';
import Input from '@/src/components/Input';
import { useAuth } from '@/src/contexts/AuthContext';
import { colors } from '@/src/theme';

export default function PartnerPortalScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { data, error } = await signIn(email.trim().toLowerCase(), password);
    if (error) {
      Alert.alert('Login failed', error.message);
    } else {
      const role = (data as { user?: { role?: string } })?.user?.role;
      if (role !== 'agent' && role !== 'admin' && role !== 'super_admin') {
        Alert.alert('Access denied', 'This login is for approved partners only.');
      } else {
        router.replace('/(agent)/(tabs)/dashboard');
      }
    }
    setLoading(false);
  };

  return (
    <Screen title="Partner Portal" showBack scroll>
      <BrandLogo style={{ marginBottom: 16 }} />
      <Text style={styles.heading}>Partner sign in</Text>
      <Text style={styles.sub}>
        Approved agents can sign in here. New applicants should complete partner registration below.
      </Text>

      <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Sign In" onPress={handleLogin} loading={loading} variant="agent" />

      <View style={styles.signupBox}>
        <Text style={styles.signupTitle}>New to Rfincare?</Text>
        <Text style={styles.signupDesc}>
          Submit your details, PAN, bank information, and KYC documents. Our team will verify and email your login credentials.
        </Text>
        <Button
          title="Apply to become a partner"
          variant="outline"
          onPress={() => router.push('/(agent)/partner-register')}
          style={{ marginTop: 12 }}
        />
      </View>

      <TouchableOpacity onPress={() => router.replace('/(customer)/(tabs)/home')} style={styles.backLink}>
        <Text style={styles.backText}>← Back to customer sign in</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 20, fontWeight: '700', color: colors.foreground, marginBottom: 6 },
  sub: { fontSize: 14, color: colors.mutedForeground, lineHeight: 20, marginBottom: 20 },
  signupBox: {
    marginTop: 28,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.agent,
    backgroundColor: `${colors.agent}08`,
  },
  signupTitle: { fontSize: 16, fontWeight: '700', color: colors.agent },
  signupDesc: { fontSize: 13, color: colors.mutedForeground, marginTop: 6, lineHeight: 18 },
  backLink: { marginTop: 24, alignItems: 'center' },
  backText: { fontSize: 14, fontWeight: '600', color: colors.mutedForeground },
});
