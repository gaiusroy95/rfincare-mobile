import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, TextInput, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@/src/components/Screen';
import Card from '@/src/components/Card';
import Button from '@/src/components/Button';
import BankLogo from '@/src/components/BankLogo';
import { colors } from '@/src/theme';
import { fixedIncomeService, type FixedIncomeProduct } from '@/src/services/fixedIncomeService';
import {
  DEFAULT_FIXED_INCOME_FILTERS,
  getCategoryLabel,
  type FixedIncomeFilters,
} from '@/src/constants/fixedIncomeMarketplace';
import { resetFixedIncomeFilters, formatInterestRate } from '@/src/utils/fixedIncomeFilters';
import MarketplaceProductGrid from '@/src/components/marketplace/MarketplaceProductGrid';
import { FIXED_INCOME_PRODUCT_GRID, type MarketplaceProductItem } from '@/src/constants/marketplaceLeadFlow';
import MarketplaceCompareView from '@/src/components/marketplace/MarketplaceCompareView';
import { buildFixedIncomeCompareColumns, buildFixedIncomeSpecRows } from '@/src/utils/marketplaceCompareHelpers';
// @ts-expect-error JS module
import { resolveBankLogoUrl } from '@/src/utils/bankBranding';

const MAX_COMPARE = 3;

async function openUrl(url?: string | null) {
  if (!url) {
    Alert.alert('Link unavailable', 'Apply link is not available yet.');
    return;
  }
  try {
    if (await Linking.canOpenURL(url)) await Linking.openURL(url);
    else Alert.alert('Cannot open link');
  } catch {
    Alert.alert('Cannot open link');
  }
}

export default function FixedIncomeMarketplaceScreen() {
  const [products, setProducts] = useState<FixedIncomeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<FixedIncomeFilters>({ ...DEFAULT_FIXED_INCOME_FILTERS });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fixedIncomeService.listActive(filters);
      setProducts(Array.isArray(list) ? list : []);
    } catch {
      setProducts([]);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleCategorySelect = (item: MarketplaceProductItem) => {
    setFilters((prev) => ({ ...prev, category: item.slug }));
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((x) => x !== id);
        if (next.length < 2) setShowCompare(false);
        return next;
      }
      if (prev.length >= MAX_COMPARE) {
        Alert.alert('Limit reached', `You can compare up to ${MAX_COMPARE} products.`);
        return prev;
      }
      const next = [...prev, id];
      if (next.length >= 2) setShowCompare(true);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const search = filters.search?.trim().toLowerCase();
    const cat = filters.category;
    return products.filter((p) => {
      if (cat && cat !== 'all' && !(p.categories || []).includes(cat)) return false;
      if (search) {
        const hay = `${p.name || ''} ${p.providerName || ''} ${p.description || ''} ${p.highlights || ''}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
  }, [products, filters.category, filters.search]);

  const compareProducts = useMemo(
    () => products.filter((p) => selected.includes(p.id)),
    [products, selected],
  );

  const columns = useMemo(
    () => buildFixedIncomeCompareColumns(compareProducts as unknown as Record<string, unknown>[]),
    [compareProducts],
  );
  const specRows = useMemo(
    () => buildFixedIncomeSpecRows(compareProducts as unknown as Record<string, unknown>[]),
    [compareProducts],
  );

  const filterModal = (
    <Modal visible={filterModalOpen} animationType="slide" transparent onRequestClose={() => setFilterModalOpen(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setFilterModalOpen(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.filterLabel}>Search</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Provider or product name..."
              value={filters.search}
              onChangeText={(v) => setFilters((prev) => ({ ...prev, search: v }))}
            />
            <Text style={styles.filterHint}>
              Category is controlled by the grid selection. Use Reset to clear everything.
            </Text>
          </View>
          <View style={styles.modalFooter}>
            <Button title="Reset" variant="ghost" onPress={() => setFilters(resetFixedIncomeFilters())} />
            <Button title="Apply" variant="customer" onPress={() => setFilterModalOpen(false)} />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <Screen title="Fixed Income" showBack loading={loading} scroll={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Fixed Income Marketplace</Text>
          <Text style={styles.heroSub}>
            Compare FDs across banks, NBFCs and corporates. Select up to {MAX_COMPARE} to compare.
          </Text>
          <View style={styles.heroRow}>
            <Button title="Filters" variant="outline" onPress={() => setFilterModalOpen(true)} />
            <Button
              title={showCompare ? 'Hide comparison' : 'Compare selected'}
              variant="customer"
              onPress={() => {
                if (selected.length < 2) {
                  Alert.alert('Select products', 'Choose at least 2 products to compare.');
                  return;
                }
                setShowCompare((v) => !v);
              }}
            />
          </View>
        </View>

        <MarketplaceProductGrid
          items={FIXED_INCOME_PRODUCT_GRID}
          onSelect={handleCategorySelect}
          title="Choose a category"
          subtitle={filters.category !== 'all' ? `Showing ${getCategoryLabel(filters.category)}` : 'Browse all fixed income options'}
        />

        {showCompare ? (
          <MarketplaceCompareView
            title="Fixed income comparison"
            columns={columns}
            specRows={specRows}
            onRemove={(id) => setSelected((prev) => prev.filter((x) => x !== id))}
          />
        ) : null}

        <Text style={styles.hint}>
          Selected {selected.length} of {MAX_COMPARE} — tap cards to add/remove
        </Text>

        {filtered.map((p) => {
          const isSelected = selected.includes(p.id);
          const rate = p.interestRate ?? p.interestRateMax ?? p.interestRateMin;
          return (
            <TouchableOpacity key={p.id} activeOpacity={0.9} onPress={() => toggle(p.id)}>
              <Card style={[styles.card, isSelected && styles.cardSelected]}>
                <View style={styles.cardHead}>
                  <BankLogo uri={resolveBankLogoUrl(p.logoUrl) || undefined} size={44} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.provider} numberOfLines={1}>{p.providerName}</Text>
                    <Text style={styles.name} numberOfLines={2}>{p.name}</Text>
                    <Text style={styles.desc} numberOfLines={2}>{p.highlights || p.description || ''}</Text>
                  </View>
                  <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={isSelected ? colors.customer : colors.mutedForeground}
                  />
                </View>

                <View style={styles.metricsRow}>
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Rate</Text>
                    <Text style={styles.metricValue}>{formatInterestRate(rate)}</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Category</Text>
                    <Text style={styles.metricValue}>{(p.categories || [])[0] ? getCategoryLabel(String((p.categories || [])[0])) : '—'}</Text>
                  </View>
                </View>

                <Button title="Apply" variant="customer" onPress={() => openUrl(p.applyUrl)} style={{ marginTop: 10 }} />
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {filterModal}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  hero: {
    backgroundColor: colors.customer,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  heroSub: { color: '#E5E7EB', marginTop: 4, fontSize: 13, lineHeight: 18 },
  heroRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  hint: { color: colors.mutedForeground, fontSize: 12, marginTop: 6, marginBottom: 10 },
  card: { marginBottom: 12 },
  cardSelected: { borderWidth: 2, borderColor: colors.customer },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start' },
  provider: { color: colors.mutedForeground, fontSize: 12, fontWeight: '700' },
  name: { color: colors.foreground, fontSize: 15, fontWeight: '900', marginTop: 2 },
  desc: { color: colors.mutedForeground, fontSize: 12, marginTop: 2 },
  metricsRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  metric: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: colors.border },
  metricLabel: { color: colors.mutedForeground, fontSize: 11, fontWeight: '800' },
  metricValue: { color: colors.foreground, fontSize: 13, fontWeight: '900', marginTop: 2 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.background, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 14 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8 },
  modalTitle: { fontSize: 16, fontWeight: '900', color: colors.foreground },
  modalBody: { paddingVertical: 10 },
  modalFooter: { flexDirection: 'row', gap: 10, paddingTop: 8 },
  filterLabel: { fontSize: 12, fontWeight: '900', color: colors.foreground, marginBottom: 6 },
  filterHint: { fontSize: 12, color: colors.mutedForeground, marginTop: 8 },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.foreground,
    backgroundColor: colors.card,
  },
});

