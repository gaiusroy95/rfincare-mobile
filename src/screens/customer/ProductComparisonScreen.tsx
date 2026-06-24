import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Screen from '@/src/components/Screen';
import CustomerHeaderActions from '@/src/components/customer/CustomerHeaderActions';
import Button from '@/src/components/Button';
import CompareTable, { type CompareColumn, type CompareRow } from '@/src/components/CompareTable';
import { useLoanProducts } from '@/src/contexts/LoanProductsContext';
import { colors } from '@/src/theme';
import { PRODUCT_COMPARISON_ROWS } from '@/src/constants/bankProductComparisonFields';

const MAX_PRODUCT_COMPARE = 8;

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  Wallet: 'wallet',
  Home: 'home',
  Briefcase: 'briefcase',
  Car: 'car',
  GraduationCap: 'school',
};

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

function productId(p: Product, index: number) {
  return String(p.slug || p.apiKey || index);
}

export default function ProductComparisonScreen() {
  const { products, loading } = useLoanProducts();
  const list = products as Product[];
  const [selected, setSelected] = useState<string[]>([]);
  const [showTable, setShowTable] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_PRODUCT_COMPARE) {
        Alert.alert('Limit reached', `You can compare up to ${MAX_PRODUCT_COMPARE} products.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const selectedProducts = useMemo(
    () => selected.map((id) => list.find((p, i) => productId(p, i) === id)).filter(Boolean) as Product[],
    [selected, list],
  );

  const columns: CompareColumn[] = selectedProducts.map((p, i) => ({
    id: productId(p, i),
    title: String(p.label || p.name || 'Product'),
    subtitle: p.interestRange,
  }));

  const rows: CompareRow[] = PRODUCT_COMPARISON_ROWS.slice(0, 10).map((row) => ({
    label: row.label,
    values: Object.fromEntries(
      selectedProducts.map((p, i) => {
        const id = productId(p, i);
        const val = (p as Record<string, unknown>)[row.key];
        if (row.key === 'interestRate') return [id, p.interestRange || '—'];
        if (row.type === 'list' && Array.isArray(val)) return [id, val.join(', ') || '—'];
        if (row.key === 'minAmount' || row.key === 'maxAmount') {
          const feat = p.features?.find((f) => f.toLowerCase().includes('up to') || f.toLowerCase().includes('lakhs') || f.toLowerCase().includes('crore'));
          return [id, feat || '—'];
        }
        return [id, val != null ? String(val) : '—'];
      }),
    ),
  }));

  const handleCompareNow = () => {
    if (selected.length < 2) {
      Alert.alert('Select products', 'Choose at least 2 loan products to compare.');
      return;
    }
    setShowTable(true);
  };

  return (
    <Screen title="Product Comparison" loading={loading} scroll={false} showBack headerRight={<CustomerHeaderActions />}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Ionicons name="layers" size={28} color="#fff" />
          <Text style={styles.heroTitle}>Compare Loan Products</Text>
          <Text style={styles.heroSub}>
            Select products below, tap Compare Now, then apply or browse bank offers in the marketplace.
          </Text>
        </View>

        <Text style={styles.hint}>
          Selected {selected.length} of {MAX_PRODUCT_COMPARE} — tap cards to add/remove
        </Text>

        {list.map((p, index) => {
          const id = productId(p, index);
          const isSelected = selected.includes(id);
          const icon = ICON_MAP[p.icon || ''] || 'cash';
          const accent = COLOR_MAP[p.color || ''] || colors.primary;
          const amountLabel = p.features?.[0] || 'Flexible amount';
          const tenureLabel = p.features?.[1] || 'Flexible tenure';

          return (
            <TouchableOpacity
              key={id}
              activeOpacity={0.9}
              onPress={() => toggle(id)}
              style={[styles.card, isSelected && { borderColor: accent, borderWidth: 2 }]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: accent }]}>
                  <Ionicons name={icon} size={26} color="#fff" />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{p.label || p.name}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>{p.description}</Text>
                </View>
                <Ionicons
                  name={isSelected ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={isSelected ? accent : colors.mutedForeground}
                />
              </View>

              <View style={styles.metrics}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Interest</Text>
                  <Text style={[styles.metricValue, { color: accent }]}>{p.interestRange || '—'}</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Amount</Text>
                  <Text style={styles.metricValue}>{amountLabel}</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Tenure</Text>
                  <Text style={styles.metricValue}>{tenureLabel}</Text>
                </View>
              </View>

              <Button
                title="Apply for this product"
                variant="customer"
                onPress={() =>
                  router.push({
                    pathname: '/(customer)/assessment',
                    params: { loanType: String(p.slug || p.apiKey) },
                  })
                }
                style={{ marginTop: 10 }}
              />
            </TouchableOpacity>
          );
        })}

        <Button
          title={`Compare Now (${selected.length})`}
          variant="customer"
          onPress={handleCompareNow}
          disabled={selected.length < 2}
          style={{ marginTop: 8 }}
        />

        {showTable && selectedProducts.length >= 2 ? (
          <View style={styles.tableSection}>
            <Text style={styles.tableTitle}>Comparison matrix</Text>
            <View style={styles.tableWrap}>
              <CompareTable columns={columns} rows={rows} />
            </View>
          </View>
        ) : null}

        <Button
          title="Browse Bank Marketplace"
          variant="outline"
          onPress={() => router.push('/(customer)/(tabs)/marketplace')}
          style={{ marginTop: 16, marginBottom: 32 }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16 },
  hero: {
    backgroundColor: colors.customer,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 10 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.92)', marginTop: 8, lineHeight: 18 },
  hint: { fontSize: 12, color: colors.mutedForeground, marginBottom: 12, fontWeight: '600' },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.foreground },
  cardDesc: { fontSize: 13, color: colors.mutedForeground, marginTop: 4, lineHeight: 18 },
  metrics: { flexDirection: 'row', gap: 8, marginTop: 12 },
  metric: {
    flex: 1,
    backgroundColor: colors.muted,
    borderRadius: 10,
    padding: 10,
  },
  metricLabel: { fontSize: 10, color: colors.mutedForeground, fontWeight: '600' },
  metricValue: { fontSize: 12, fontWeight: '700', color: colors.foreground, marginTop: 4 },
  tableSection: { marginTop: 20 },
  tableTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  tableWrap: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    overflow: 'hidden',
  },
});
