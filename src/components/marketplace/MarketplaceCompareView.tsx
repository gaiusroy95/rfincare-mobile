import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BankLogo from '@/src/components/BankLogo';
import Button from '@/src/components/Button';
import { colors } from '@/src/theme';

export type CompareMetric = { label: string; value: string };
export type CompareProductColumn = {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string | null;
  imageUri?: string;
  metrics?: CompareMetric[];
  features?: string[];
  price?: string;
  priceLabel?: string;
  savingsText?: string | null;
  ctaUrl?: string | null;
  ctaLabel?: string;
};

export type CompareSpecRow = { label: string; values: Record<string, string> };

type Props = {
  title?: string;
  columns: CompareProductColumn[];
  specRows?: CompareSpecRow[];
  onRemove?: (id: string) => void;
  onCtaPress?: (column: CompareProductColumn) => void;
};

export default function MarketplaceCompareView({ title, columns, specRows = [], onRemove, onCtaPress }: Props) {
  if (columns.length < 2) return null;

  const openUrl = async (url?: string | null) => {
    if (!url) return;
    try {
      if (await Linking.canOpenURL(url)) await Linking.openURL(url);
    } catch { /* ignore */ }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Ionicons name="git-compare" size={20} color={colors.customer} />
        <Text style={styles.headerTitle}>{title || `Compare ${columns.length} products`}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Product headers */}
          <View style={styles.productRow}>
            <View style={styles.cornerCell} />
            {columns.map((col) => (
              <View key={col.id} style={styles.productCell}>
                {onRemove ? (
                  <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(col.id)}>
                    <Ionicons name="close" size={14} color={colors.mutedForeground} />
                  </TouchableOpacity>
                ) : null}
                <BankLogo uri={col.imageUri} size={48} style={styles.logo} />
                <Text style={styles.provider} numberOfLines={1}>{col.subtitle}</Text>
                <Text style={styles.productName} numberOfLines={2}>{col.title}</Text>
                {col.badge ? <Text style={styles.badge}>{col.badge}</Text> : null}
              </View>
            ))}
          </View>

          {/* Quick metrics */}
          <View style={styles.specRow}>
            <View style={styles.labelCell}><Text style={styles.labelText}>Quick snapshot</Text></View>
            {columns.map((col) => (
              <View key={col.id} style={styles.valueCell}>
                {(col.metrics || []).map((m) => (
                  <View key={m.label} style={styles.metricBox}>
                    <Text style={styles.metricLabel}>{m.label}</Text>
                    <Text style={styles.metricValue}>{m.value}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* Spec rows */}
          {specRows.map((row, i) => (
            <View key={row.label} style={[styles.specRow, i % 2 === 1 && styles.specRowAlt]}>
              <View style={styles.labelCell}><Text style={styles.labelText}>{row.label}</Text></View>
              {columns.map((col) => (
                <View key={col.id} style={styles.valueCell}>
                  <Text style={styles.valueText}>{row.values[col.id] || '—'}</Text>
                </View>
              ))}
            </View>
          ))}

          {/* Features */}
          <View style={styles.specRow}>
            <View style={styles.labelCell}><Text style={styles.labelText}>Key features</Text></View>
            {columns.map((col) => (
              <View key={col.id} style={styles.valueCell}>
                {(col.features || []).slice(0, 4).map((f) => (
                  <View key={f} style={styles.featureLine}>
                    <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                    <Text style={styles.featureText} numberOfLines={2}>{f}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* CTA row */}
          <View style={[styles.specRow, styles.ctaRow]}>
            <View style={styles.labelCell}><Text style={styles.ctaLabel}>Best offer</Text></View>
            {columns.map((col) => (
              <View key={col.id} style={styles.valueCell}>
                {col.savingsText ? <Text style={styles.savings}>{col.savingsText}</Text> : null}
                <Text style={styles.price}>{col.price || '—'}</Text>
                {col.priceLabel ? <Text style={styles.priceSub}>{col.priceLabel}</Text> : null}
                {col.ctaUrl || onCtaPress ? (
                  <Button
                    title={col.ctaLabel || 'View'}
                    variant="customer"
                    onPress={() => (onCtaPress ? onCtaPress(col) : openUrl(col.ctaUrl))}
                    style={styles.ctaBtn}
                  />
                ) : null}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const COL_W = 150;
const LABEL_W = 110;

const styles = StyleSheet.create({
  wrap: { marginBottom: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 15, fontWeight: '800', color: colors.foreground },
  productRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  cornerCell: { width: LABEL_W },
  productCell: { width: COL_W, padding: 10, alignItems: 'center', borderLeftWidth: 1, borderLeftColor: colors.border },
  removeBtn: { alignSelf: 'flex-end', padding: 4 },
  logo: { marginBottom: 6 },
  provider: { fontSize: 9, fontWeight: '700', color: colors.customer, textTransform: 'uppercase' },
  productName: { fontSize: 12, fontWeight: '800', color: colors.foreground, textAlign: 'center' },
  badge: { marginTop: 4, fontSize: 9, fontWeight: '700', color: '#047857', backgroundColor: '#D1FAE5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, overflow: 'hidden' },
  specRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  specRowAlt: { backgroundColor: colors.muted },
  labelCell: { width: LABEL_W, padding: 10, justifyContent: 'center' },
  valueCell: { width: COL_W, padding: 10, borderLeftWidth: 1, borderLeftColor: colors.border, justifyContent: 'center' },
  labelText: { fontSize: 11, fontWeight: '700', color: colors.mutedForeground },
  valueText: { fontSize: 12, fontWeight: '600', color: colors.foreground, textAlign: 'center' },
  metricBox: { backgroundColor: colors.muted, borderRadius: 8, padding: 6, marginBottom: 4 },
  metricLabel: { fontSize: 9, color: colors.mutedForeground, textAlign: 'center' },
  metricValue: { fontSize: 12, fontWeight: '800', color: colors.foreground, textAlign: 'center' },
  featureLine: { flexDirection: 'row', gap: 4, alignItems: 'flex-start', marginBottom: 4 },
  featureText: { flex: 1, fontSize: 10, color: colors.foreground },
  ctaRow: { backgroundColor: '#FFF7ED' },
  ctaLabel: { fontSize: 12, fontWeight: '800', color: colors.foreground },
  savings: { fontSize: 9, fontWeight: '700', color: '#047857', textAlign: 'center', marginBottom: 4 },
  price: { fontSize: 18, fontWeight: '900', color: colors.foreground, textAlign: 'center' },
  priceSub: { fontSize: 10, color: colors.mutedForeground, textAlign: 'center', marginBottom: 6 },
  ctaBtn: { marginTop: 4 },
});
