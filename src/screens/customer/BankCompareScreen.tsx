import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BankLogo from '@/src/components/BankLogo';
import Screen from '@/src/components/Screen';
import Button from '@/src/components/Button';
import CompareTable, { type CompareColumn, type CompareRow } from '@/src/components/CompareTable';
import { colors } from '@/src/theme';
import { bankService } from '@/src/services/apiServices';
import { getMarketplaceCompareKey, listMarketplaceOffers } from '@/src/utils/bankMarketplace';
import { PRODUCT_COMPARISON_ROWS } from '@/src/constants/bankProductComparisonFields';
import { loadCompareSelection } from '@/src/utils/marketplaceCompareStorage';

type Offer = Record<string, unknown> & {
  name?: string;
  productName?: string;
  logo?: string | null;
  compareKey?: string;
  loanType?: string;
};

export default function BankCompareScreen() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loanCategory, setLoanCategory] = useState('personal_loan');

  useEffect(() => {
    (async () => {
      const { compareIds, loanCategory: cat } = await loadCompareSelection();
      setLoanCategory(cat);
      try {
        const res = await bankService.getActiveBanks();
        const banks = res?.data || res || [];
        const all = listMarketplaceOffers(banks, cat) as Offer[];
        const selected = compareIds
          .map((id) => all.find((o) => getMarketplaceCompareKey(o) === id))
          .filter(Boolean) as Offer[];
        setOffers(selected);
      } catch {
        setOffers([]);
      }
      setLoading(false);
    })();
  }, []);

  const columns: CompareColumn[] = offers.map((o, i) => ({
    id: getMarketplaceCompareKey(o) || `c-${i}`,
    title: String(o.name || 'Bank'),
    subtitle: String(o.productName || ''),
    imageUri: o.logo ? String(o.logo) : undefined,
  }));

  const rows: CompareRow[] = PRODUCT_COMPARISON_ROWS.map((row: { key: string; label: string; type?: string }) => ({
    label: row.label,
    values: Object.fromEntries(
      offers.map((o, i) => {
        const id = columns[i]?.id || `c-${i}`;
        const val = o[row.key];
        if (row.type === 'list' && Array.isArray(val)) return [id, val.join(', ') || '—'];
        return [id, val != null && val !== '' ? String(val) : '—'];
      }),
    ),
  }));

  const bestRateIndex = useMemo(() => {
    let best = -1;
    let bestVal = Infinity;
    offers.forEach((o, i) => {
      const rate = Number(o.interestRate ?? o.interestRateMin ?? 99);
      if (rate < bestVal) {
        bestVal = rate;
        best = i;
      }
    });
    return best;
  }, [offers]);

  return (
    <Screen title="Bank Comparison" loading={loading} scroll={false}>
      {offers.length === 0 && !loading ? (
        <View style={styles.empty}>
          <Ionicons name="git-compare-outline" size={48} color={colors.mutedForeground} />
          <Text style={styles.emptyTitle}>No banks selected</Text>
          <Text style={styles.emptyHint}>Go back to the marketplace and add banks to compare.</Text>
          <Button title="Back to Marketplace" variant="customer" onPress={() => router.back()} style={{ marginTop: 16 }} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Ionicons name="analytics" size={24} color="#fff" />
            <Text style={styles.heroTitle}>Comparing {offers.length} bank offers</Text>
            <Text style={styles.heroSub}>Side-by-side rates, fees, tenure, and eligibility match</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.logoRow}>
            {offers.map((o, i) => (
              <View key={getMarketplaceCompareKey(o) || String(i)} style={styles.logoCard}>
                <BankLogo uri={o.logo ? String(o.logo) : null} size={56} backgroundColor={colors.muted} />
                <Text style={styles.logoName} numberOfLines={1}>{o.name}</Text>
                {i === bestRateIndex ? (
                  <View style={styles.bestBadge}>
                    <Text style={styles.bestText}>Best rate</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </ScrollView>

          <View style={styles.tableWrap}>
            <CompareTable columns={columns} rows={rows} />
          </View>

          <Text style={styles.applyHeading}>Ready to apply?</Text>
          {offers.map((o, i) => (
            <Button
              key={getMarketplaceCompareKey(o) || String(i)}
              title={`Apply — ${o.name}`}
              variant={i === bestRateIndex ? 'customer' : 'outline'}
              onPress={() =>
                router.push({
                  pathname: '/(customer)/assessment',
                  params: { loanType: String(o.loanType || loanCategory) },
                })
              }
              style={{ marginBottom: 8 }}
            />
          ))}

          <Button title="Back to Marketplace" variant="ghost" onPress={() => router.back()} style={{ marginTop: 8, marginBottom: 24 }} />
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 32 },
  hero: {
    backgroundColor: colors.customer,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginTop: 8 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  logoRow: { marginBottom: 16 },
  logoCard: {
    width: 100,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  logoName: { fontSize: 11, fontWeight: '600', marginTop: 6, textAlign: 'center', color: colors.foreground },
  bestBadge: {
    marginTop: 6,
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bestText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  tableWrap: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  applyHeading: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: colors.foreground },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptyHint: { fontSize: 13, color: colors.mutedForeground, textAlign: 'center', marginTop: 8 },
});
