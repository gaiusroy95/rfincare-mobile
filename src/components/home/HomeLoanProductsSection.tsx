import React, { useMemo } from 'react';
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
  Shield: 'shield-checkmark',
  TrendingUp: 'trending-up',
  GitCompare: 'git-compare',
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
  kind?: string;
  route?: string;
};

type Props = {
  products: Product[];
  loading?: boolean;
};

function resolveAccent(color?: string) {
  if (!color) return colors.primary;
  return COLOR_MAP[color] || color;
}

function resolveViewRoute(item: Product) {
  if (item.route) return item.route;
  if (item.kind === 'compare') return '/(customer)/product-comparison';
  if (isCreditCard(item)) return '/(customer)/credit-cards';
  if (item.slug) return `/(customer)/product/${item.slug}`;
  return '/(customer)/(tabs)/home';
}

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
          const accent = resolveAccent(loan.color);
          const title = loan.label || loan.name || 'Loan';
          const creditCard = isCreditCard(loan);
          const isCompare = loan.kind === 'compare';
          const isMarketplace = loan.kind === 'marketplace';
          const rateLabel = isMarketplace ? 'Starting from' : 'Interest rate';

          return (
            <View
              key={loan.slug}
              style={[styles.card, isCompare && styles.compareCard]}
            >
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
                  <Text style={styles.rateLabel}>{rateLabel}</Text>
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
                  onPress={() => router.push(resolveViewRoute(loan) as never)}
                >
                  <Text style={styles.btnTextPrimary}>
                    {isCompare ? 'Compare' : 'View'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnOutline}
                  onPress={() => {
                    if (isCompare || isMarketplace) {
                      router.push(resolveViewRoute(loan) as never);
                      return;
                    }
                    if (creditCard) {
                      router.push('/(customer)/credit-cards');
                      return;
                    }
                    void openAssessmentOrEligibilityFirst({ loanType: loan.slug });
                  }}
                >
                  <Text style={styles.btnTextOutline}>
                    {isCompare ? 'Start' : isMarketplace ? 'Explore' : creditCard ? 'View cards' : 'Apply'}
                  </Text>
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
  compareCard: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
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
