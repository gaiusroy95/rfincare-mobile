import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '@/src/theme';
import { openAssessmentOrEligibilityFirst } from '@/src/utils/eligibilityGate';

type Action = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
};

const ACTIONS: Action[] = [
  {
    title: 'Check Eligibility',
    subtitle: 'OTP + instant score',
    icon: 'shield-checkmark',
    color: colors.customer,
    route: '/(customer)/eligibility',
  },
  {
    title: 'Apply for Loan',
    subtitle: 'After eligibility check',
    icon: 'document-text',
    color: colors.primary,
    route: 'assessment',
  },
  {
    title: 'Bank Marketplace',
    subtitle: 'Compare lenders',
    icon: 'business',
    color: colors.secondary,
    route: '/(customer)/(tabs)/marketplace',
  },
  {
    title: 'EMI Calculator',
    subtitle: 'Plan repayments',
    icon: 'calculator',
    color: colors.accent,
    route: '/(customer)/emi-calculator',
  },
];

type Props = {
  showLogin?: boolean;
  onStatusCheck?: () => void;
};

export default function HomeQuickActions({ showLogin, onStatusCheck }: Props) {
  return (
    <View style={styles.grid}>
      {ACTIONS.map((action) => (
        <TouchableOpacity
          key={action.title}
          style={styles.card}
          activeOpacity={0.85}
          onPress={() => {
            if (action.route === 'assessment') {
              void openAssessmentOrEligibilityFirst();
              return;
            }
            router.push(action.route as never);
          }}
        >
          <View style={[styles.iconWrap, { backgroundColor: `${action.color}18` }]}>
            <Ionicons name={action.icon} size={26} color={action.color} />
          </View>
          <Text style={styles.title}>{action.title}</Text>
          <Text style={styles.subtitle}>{action.subtitle}</Text>
        </TouchableOpacity>
      ))}
      {showLogin ? (
        <TouchableOpacity
          style={[styles.card, styles.loginCard]}
          activeOpacity={0.85}
          onPress={() => router.push('/(customer)/login')}
        >
          <View style={[styles.iconWrap, { backgroundColor: `${colors.customer}18` }]}>
            <Ionicons name="log-in" size={26} color={colors.customer} />
          </View>
          <Text style={styles.title}>Customer Login</Text>
          <Text style={styles.subtitle}>Track applications</Text>
        </TouchableOpacity>
      ) : null}
      {onStatusCheck ? (
        <TouchableOpacity style={styles.statusCard} activeOpacity={0.85} onPress={onStatusCheck}>
          <Ionicons name="search" size={18} color={colors.primary} />
          <Text style={styles.statusText}>Check application status / Resume draft</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  card: {
    width: '48%',
    flexGrow: 1,
    minWidth: '46%',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  loginCard: { borderColor: colors.customer },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: { fontSize: 14, fontWeight: '700', color: colors.foreground },
  subtitle: { fontSize: 11, color: colors.mutedForeground, marginTop: 4, lineHeight: 15 },
  statusCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.muted,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusText: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.primary },
});
