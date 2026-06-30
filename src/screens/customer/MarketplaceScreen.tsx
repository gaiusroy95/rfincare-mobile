import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Screen from '@/src/components/Screen';
import CustomerHeaderActions from '@/src/components/customer/CustomerHeaderActions';
import Button from '@/src/components/Button';
import FilterSheet, { type FilterField } from '@/src/components/FilterSheet';
import BankOfferCard from '@/src/components/marketplace/BankOfferCard';
import CompareSelectionBar from '@/src/components/marketplace/CompareSelectionBar';
import { colors } from '@/src/theme';
import { bankService } from '@/src/services/apiServices';
import { getMarketplaceCompareKey, listMarketplaceOffers } from '@/src/utils/bankMarketplace';
import { MAX_BANK_COMPARE } from '@/src/constants/bankComparison';
import { saveCompareSelection } from '@/src/utils/marketplaceCompareStorage';
import { openAssessmentOrEligibilityFirst } from '@/src/utils/eligibilityGate';

type Offer = {
  id?: string | number;
  productId?: string | number;
  compareKey?: string;
  name?: string;
  productName?: string;
  logo?: string | null;
  interestRate?: number | null;
  interestRateLabel?: string;
  probability?: number;
  minAmount?: string | number | null;
  maxAmount?: string | number | null;
  processingFee?: string;
  features?: string[];
  loanType?: string;
};

const FILTER_FIELDS: FilterField[] = [
  { key: 'loanAmount', label: 'Loan Amount (₹)', type: 'number', placeholder: '500000' },
  { key: 'minRate', label: 'Max Interest Rate (%)', type: 'number', placeholder: '12' },
  { key: 'bankType', label: 'Bank Type', type: 'text', placeholder: 'public / private' },
];

const ALL_CATEGORY = 'all';

const LOAN_CATEGORIES = [
  { key: ALL_CATEGORY, label: 'All' },
  { key: 'personal_loan', label: 'Personal' },
  { key: 'home_loan', label: 'Home' },
  { key: 'business_loan', label: 'Business' },
  { key: 'auto_loan', label: 'Auto' },
  { key: 'education_loan', label: 'Education' },
  { key: 'credit_card', label: 'Credit Card' },
];

function offerKey(item: Offer, index: number) {
  return getMarketplaceCompareKey(item) || `offer-${index}`;
}

export default function MarketplaceScreen() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'probability' | 'interest' | 'name'>('probability');
  const [compare, setCompare] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [loanCategory, setLoanCategory] = useState(ALL_CATEGORY);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bankService.getActiveBanks();
      const banks = res?.data || res || [];
      const categoryFilter = loanCategory === ALL_CATEGORY ? null : loanCategory;
      setOffers(listMarketplaceOffers(banks, categoryFilter));
    } catch {
      setOffers([]);
    }
    setLoading(false);
  }, [loanCategory]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const filtered = useMemo(() => {
    const bankTypeFilter = filters.bankType?.trim().toLowerCase();
    let list = offers.filter((o) => {
      const matchSearch =
        !search ||
        o.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.productName?.toLowerCase().includes(search.toLowerCase());
      const amount = Number(filters.loanAmount);
      const maxRate = Number(filters.minRate);
      const amountOk = !amount || o.maxAmount == null || Number(String(o.maxAmount).replace(/\D/g, '')) >= amount;
      const rateOk = !maxRate || o.interestRate == null || o.interestRate <= maxRate;
      const bankTypeOk =
        !bankTypeFilter ||
        String((o as Offer & { type?: string }).type || '').toLowerCase().includes(bankTypeFilter);
      return matchSearch && amountOk && rateOk && bankTypeOk;
    });

    return [...list].sort((a, b) => {
      if (sort === 'interest') return (a.interestRate ?? 99) - (b.interestRate ?? 99);
      if (sort === 'name') return (a.name || '').localeCompare(b.name || '');
      return (b.probability ?? 0) - (a.probability ?? 0);
    });
  }, [offers, search, sort, filters]);

  const compareOffers = compare
    .map((id) => offers.find((x) => getMarketplaceCompareKey(x) === id))
    .filter(Boolean) as Offer[];

  const toggleCompare = (id: string) => {
    if (!id) return;
    setCompare((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_BANK_COMPARE) {
        Alert.alert('Limit reached', `You can compare up to ${MAX_BANK_COMPARE} banks at once.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const openCompare = async () => {
    if (compare.length < 2) return;
    await saveCompareSelection(compare, loanCategory);
    router.push('/(customer)/bank-compare');
  };

  const listHeader = (
    <View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="business" size={20} color={colors.primary} />
          <Text style={styles.statVal}>{filtered.length}</Text>
          <Text style={styles.statLabel}>Offers</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="git-compare" size={20} color={colors.customer} />
          <Text style={styles.statVal}>{compare.length}/{MAX_BANK_COMPARE}</Text>
          <Text style={styles.statLabel}>Selected</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trending-down" size={20} color={colors.success} />
          <Text style={styles.statVal}>25+</Text>
          <Text style={styles.statLabel}>Banks</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.mutedForeground} style={styles.searchIcon} />
        <TextInput
          style={styles.search}
          placeholder="Search banks or products..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={colors.mutedForeground}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        {LOAN_CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.key}
            style={[styles.categoryChip, loanCategory === c.key && styles.categoryChipActive]}
            onPress={() => {
              if (c.key === 'credit_card') {
                router.push('/(customer)/credit-cards');
                return;
              }
              setLoanCategory(c.key);
              setCompare([]);
            }}
          >
            <Text style={[styles.categoryText, loanCategory === c.key && styles.categoryTextActive]}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sortRow}>
        <Button title="Filters" variant="outline" onPress={() => setFilterOpen(true)} style={{ marginRight: 8 }} />
        {(['probability', 'interest', 'name'] as const).map((s) => (
          <TouchableOpacity key={s} onPress={() => setSort(s)} style={[styles.sortBtn, sort === s && styles.sortActive]}>
            <Text style={[styles.sortText, sort === s && styles.sortTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button title="Check Eligibility First" variant="outline" onPress={() => router.push('/(customer)/eligibility')} style={{ marginBottom: 12 }} />
    </View>
  );

  return (
    <Screen title="Bank Marketplace" loading={loading} scroll={false} headerRight={<CustomerHeaderActions />}>
      <FlatList
        data={filtered}
        keyExtractor={(item, index) => offerKey(item, index)}
        ListHeaderComponent={listHeader}
        contentContainerStyle={[styles.listContent, compare.length > 0 && styles.listPaddingBottom]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const compareId = getMarketplaceCompareKey(item) || offerKey(item, index);
          const selected = compare.includes(compareId);
          return (
            <BankOfferCard
              offer={item}
              selected={selected}
              onApply={() =>
                void openAssessmentOrEligibilityFirst({
                  loanType: item.loanType || (loanCategory === ALL_CATEGORY ? undefined : loanCategory),
                })
              }
              onToggleCompare={() => toggleCompare(compareId)}
            />
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>
              {loanCategory === ALL_CATEGORY
                ? 'No bank offers match your filters.'
                : 'No bank offers match your filters. Try another loan type.'}
            </Text>
          ) : null
        }
      />

      <CompareSelectionBar
        items={compareOffers.map((o) => ({
          id: getMarketplaceCompareKey(o) || '',
          title: String(o.name),
          logo: o.logo,
        }))}
        max={MAX_BANK_COMPARE}
        onCompareNow={openCompare}
        onClear={() => setCompare([])}
      />

      <FilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        fields={FILTER_FIELDS}
        values={filters}
        onChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
        onApply={() => {}}
        onReset={() => setFilters({})}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: 16, paddingBottom: 24 },
  listPaddingBottom: { paddingBottom: 140 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    alignItems: 'center',
  },
  statVal: { fontSize: 16, fontWeight: '800', color: colors.foreground, marginTop: 4 },
  statLabel: { fontSize: 10, color: colors.mutedForeground },
  searchWrap: { position: 'relative', marginBottom: 12 },
  searchIcon: { position: 'absolute', left: 14, top: 14, zIndex: 1 },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    paddingLeft: 40,
    backgroundColor: colors.card,
    fontSize: 15,
  },
  categoryRow: { marginBottom: 12 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.muted,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: { backgroundColor: colors.customer, borderColor: colors.customer },
  categoryText: { fontSize: 12, fontWeight: '600', color: colors.mutedForeground },
  categoryTextActive: { color: '#fff' },
  sortRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  sortBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  sortActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  sortText: { fontSize: 11, color: colors.mutedForeground, textTransform: 'capitalize' },
  sortTextActive: { color: '#fff' },
  empty: { textAlign: 'center', color: colors.mutedForeground, paddingVertical: 32 },
});
