import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SectionHeader from '@/src/components/home/SectionHeader';
import { colors } from '@/src/theme';
import { openAssessmentOrEligibilityFirst } from '@/src/utils/eligibilityGate';

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  Wallet: 'wallet',
  Home: 'home',
  Briefcase: 'briefcase',
  Car: 'car',
  GraduationCap: 'school',
  CreditCard: 'card',
  Landmark: 'business',
  Heart: 'heart',
  Shield: 'shield-checkmark',
  PiggyBank: 'wallet',
  TrendingUp: 'trending-up',
};

const CREDIT_CARD_SLUGS = new Set(['credit_card', 'creditcard']);

function isCreditCard(loan: Product) {
  return CREDIT_CARD_SLUGS.has(String(loan.slug || '')) || String(loan.apiKey || '') === 'credit_card';
}

const COLOR_MAP: Record<string, string> = {
  'var(--color-primary)': colors.primary,
  'var(--color-secondary)': colors.secondary,
  'var(--color-accent)': colors.accent,
  'var(--color-conversion)': colors.conversion,
};

type Product = {
  slug?: string;
  apiKey?: string;
  name?: string;
  label?: string;
  description?: string;
  icon?: string;
  color?: string;
  interestRange?: string;
  features?: string[];
};

type Props = {
  products: Product[];
  loading?: boolean;
};

export default function HomeLoanProductsSection({ products, loading }: Props) {
  return (
    <View>
      <SectionHeader
        title="Loan Solutions for Every Need"
        subtitle="From personal milestones to business growth — compare and apply in minutes."
      />
      {loading ? <Text style={styles.loading}>Loading loan products…</Text> : null}
      <View style={styles.grid}>
        {products.map((loan) => {
          const icon = ICON_MAP[loan.icon || ''] || 'cash';
          const accent = COLOR_MAP[loan.color || ''] || colors.primary;
          const title = loan.label || loan.name || 'Loan';
          const creditCard = isCreditCard(loan);
          return (
            <View key={loan.slug} style={styles.card}>
              <View style={styles.header}>
                <View style={[styles.iconWrap, { backgroundColor: accent }]}>
                  <Ionicons name={icon} size={24} color="#fff" />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.title}>{title}</Text>
                  <Text style={styles.desc} numberOfLines={2}>{loan.description}</Text>
                </View>
              </View>
              {loan.interestRange ? (
                <View style={styles.rateBox}>
                  <Text style={styles.rateLabel}>Interest rate</Text>
                  <Text style={[styles.rateValue, { color: accent }]}>{loan.interestRange}</Text>
                </View>
              ) : null}
              {(loan.features || []).slice(0, 2).map((f) => (
                <View key={f} style={styles.feature}>
                  <Ionicons name="checkmark-circle" size={14} color={accent} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: accent }]}
                  onPress={() =>
                    creditCard
                      ? router.push('/(customer)/credit-cards')
                      : loan.slug && router.push(`/(customer)/product/${loan.slug}` as never)
                  }
                >
                  <Text style={styles.btnTextPrimary}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnOutline}
                  onPress={() =>
                    creditCard
                      ? router.push('/(customer)/credit-cards')
                      : void openAssessmentOrEligibilityFirst({ loanType: loan.slug })
                  }
                >
                  <Text style={styles.btnTextOutline}>{creditCard ? 'View cards' : 'Apply'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { color: colors.mutedForeground, marginBottom: 8 },
  grid: { gap: 12 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  header: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', color: colors.foreground },
  desc: { fontSize: 12, color: colors.mutedForeground, marginTop: 4, lineHeight: 16 },
  rateBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.muted,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  rateLabel: { fontSize: 12, color: colors.mutedForeground },
  rateValue: { fontSize: 13, fontWeight: '700' },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  featureText: { fontSize: 12, color: colors.mutedForeground, flex: 1 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  btnTextPrimary: { color: '#fff', fontWeight: '700', fontSize: 13 },
  btnOutline: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnTextOutline: { color: colors.primary, fontWeight: '700', fontSize: 13 },
});
