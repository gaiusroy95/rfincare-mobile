import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import BrandLogo from '@/src/components/BrandLogo';
import { colors, radii } from '@/src/theme';

export default function RolePicker() {
  return (
    <View style={styles.container}>
      <BrandLogo size="lg" style={styles.logo} />
      <Text style={styles.sub}>Choose how you want to continue</Text>

      <TouchableOpacity
        style={[styles.card, { borderColor: colors.customer }]}
        onPress={() => router.push('/(customer)/(tabs)/home')}
        activeOpacity={0.85}
      >
        <Text style={[styles.cardTitle, { color: colors.customer }]}>Customer</Text>
        <Text style={styles.cardDesc}>
          Apply for loans, check eligibility, browse bank offers, and track your applications.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, { borderColor: colors.agent }]}
        onPress={() => router.push('/(agent)/login')}
        activeOpacity={0.85}
      >
        <Text style={[styles.cardTitle, { color: colors.agent }]}>Agent</Text>
        <Text style={styles.cardDesc}>
          Assist customers, manage applications, view commissions, and access training.
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'center',
  },
  logo: { alignSelf: 'center', marginBottom: 24, width: '100%' },
  sub: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 2,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  cardDesc: { fontSize: 14, color: colors.mutedForeground, lineHeight: 20 },
});
