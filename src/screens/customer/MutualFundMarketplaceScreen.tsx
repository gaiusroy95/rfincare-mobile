import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Linking,
  ScrollView, TextInput, Modal, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@/src/components/Screen';
import Card from '@/src/components/Card';
import Button from '@/src/components/Button';
import BankLogo from '@/src/components/BankLogo';
import { colors } from '@/src/theme';
import { mutualFundService, type MutualFund } from '@/src/services/mutualFundService';
import {
  DEFAULT_MUTUAL_FUND_FILTERS,
  EXPENSE_RATIO_OPTIONS,
  MUTUAL_FUND_CATEGORIES,
  RATING_FILTER_OPTIONS,
  RETURNS_FILTER_OPTIONS,
  RISK_LEVELS,
  getCategoryLabel,
  getRiskLabel,
  type MutualFundFilters,
} from '@/src/constants/mutualFundMarketplace';
import {
  countActiveFilters,
  formatAum,
  formatPercent,
  formatRating,
  resetMutualFundFilters,
} from '@/src/utils/mutualFundFilters';
import {
  buildMutualFundCompareColumns,
  buildMutualFundSpecRows,
} from '@/src/utils/marketplaceCompareHelpers';
import MarketplaceCompareView from '@/src/components/marketplace/MarketplaceCompareView';
import MarketplaceProductGrid from '@/src/components/marketplace/MarketplaceProductGrid';
import MarketplaceLeadWizard from '@/src/components/marketplace/MarketplaceLeadWizard';
import MutualFundCalculatorCard from '@/src/components/mutual-funds/MutualFundCalculatorCard';
import { MUTUAL_FUND_PRODUCT_GRID, type MarketplaceProductItem } from '@/src/constants/marketplaceLeadFlow';
import {
  loadMarketplaceProfile,
  saveMarketplaceProfile,
  type MarketplaceProfile,
} from '@/src/utils/marketplaceLeadSession';
// @ts-expect-error JS module
import { resolveBankLogoUrl } from '@/src/utils/bankBranding';

const MAX_COMPARE = 3;

function resolveLogo(fund: MutualFund) {
  return resolveBankLogoUrl(fund?.logoUrl) || null;
}

async function openUrl(url?: string | null) {
  if (!url) {
    Alert.alert('Link unavailable', 'Invest link is not available yet.');
    return;
  }
  try {
    if (await Linking.canOpenURL(url)) await Linking.openURL(url);
    else Alert.alert('Cannot open link');
  } catch {
    Alert.alert('Cannot open link');
  }
}

export default function MutualFundMarketplaceScreen() {
  const [profile, setProfile] = useState<MarketplaceProfile | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<MarketplaceProductItem | null>(null);
  const [funds, setFunds] = useState<MutualFund[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<MutualFundFilters>({ ...DEFAULT_MUTUAL_FUND_FILTERS });

  useEffect(() => {
    loadMarketplaceProfile('mutual_funds').then((saved) => {
      if (saved) {
        setProfile(saved);
        setShowCatalog(true);
        if (saved.productCategory && saved.productCategory !== 'all') {
          setFilters((prev) => ({ ...prev, category: saved.productCategory! }));
        }
      }
    });
  }, []);

  const loadFunds = useCallback(async () => {
    if (!showCatalog) return;
    setLoading(true);
    try {
      const list = await mutualFundService.listActive(filters);
      setFunds(Array.isArray(list) ? list : []);
    } catch {
      setFunds([]);
    }
    setLoading(false);
  }, [filters, showCatalog]);

  useEffect(() => { loadFunds(); }, [loadFunds]);

  const handleProductSelect = (item: MarketplaceProductItem) => {
    if (profile?.verifiedAt) {
      setFilters((prev) => ({ ...prev, category: item.slug }));
      setShowCatalog(true);
      return;
    }
    setPendingProduct(item);
    setWizardOpen(true);
  };

  const handleWizardComplete = async (completed: MarketplaceProfile) => {
    const saved = await saveMarketplaceProfile('mutual_funds', {
      ...completed,
      productCategory: pendingProduct?.slug || completed.productCategory,
      productLabel: pendingProduct?.label || completed.productLabel,
    });
    setProfile(saved);
    if (saved.productCategory && saved.productCategory !== 'all') {
      setFilters((prev) => ({ ...prev, category: saved.productCategory! }));
    }
    setWizardOpen(false);
    setPendingProduct(null);
    setShowCatalog(true);
  };

  const compareFunds = useMemo(
    () => funds.filter((f) => selected.includes(f.id)),
    [funds, selected],
  );

  const activeFilterCount = countActiveFilters(filters);

  const updateFilter = <K extends keyof MutualFundFilters>(key: K, value: MutualFundFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filterModal = (
    <Modal visible={filterModalOpen} animationType="slide" transparent onRequestClose={() => setFilterModalOpen(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setFilterModalOpen(false)}><Ionicons name="close" size={24} color={colors.foreground} /></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.filterLabel}>Search</Text>
            <TextInput style={styles.searchInput} placeholder="AMC or fund name..." value={filters.search} onChangeText={(v) => updateFilter('search', v)} />
            <Text style={styles.filterLabel}>Risk level</Text>
            <TouchableOpacity style={[styles.filterChip, filters.riskLevel === 'all' && styles.filterChipActive]} onPress={() => updateFilter('riskLevel', 'all')}>
              <Text style={[styles.filterChipText, filters.riskLevel === 'all' && styles.filterChipTextActive]}>Any risk</Text>
            </TouchableOpacity>
            {RISK_LEVELS.map((risk) => (
              <TouchableOpacity key={risk.slug} style={[styles.filterChip, filters.riskLevel === risk.slug && styles.filterChipActive]} onPress={() => updateFilter('riskLevel', risk.slug)}>
                <Text style={[styles.filterChipText, filters.riskLevel === risk.slug && styles.filterChipTextActive]}>{risk.label}</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.filterLabel}>Returns</Text>
            {RETURNS_FILTER_OPTIONS.map((opt) => (
              <TouchableOpacity key={opt.value} style={[styles.filterChip, filters.returns === opt.value && styles.filterChipActive]} onPress={() => updateFilter('returns', opt.value)}>
                <Text style={[styles.filterChipText, filters.returns === opt.value && styles.filterChipTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.filterLabel}>Expense ratio</Text>
            {EXPENSE_RATIO_OPTIONS.map((opt) => (
              <TouchableOpacity key={opt.value} style={[styles.filterChip, filters.expenseRatio === opt.value && styles.filterChipActive]} onPress={() => updateFilter('expenseRatio', opt.value)}>
                <Text style={[styles.filterChipText, filters.expenseRatio === opt.value && styles.filterChipTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.filterLabel}>Rating</Text>
            {RATING_FILTER_OPTIONS.map((opt) => (
              <TouchableOpacity key={opt.value} style={[styles.filterChip, filters.rating === opt.value && styles.filterChipActive]} onPress={() => updateFilter('rating', opt.value)}>
                <Text style={[styles.filterChipText, filters.rating === opt.value && styles.filterChipTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.switchRow}><Text style={styles.switchLabel}>SIP available</Text><Switch value={filters.supportsSip} onValueChange={(v) => updateFilter('supportsSip', v)} /></View>
            <View style={styles.switchRow}><Text style={styles.switchLabel}>Lumpsum available</Text><Switch value={filters.supportsLumpsum} onValueChange={(v) => updateFilter('supportsLumpsum', v)} /></View>
          </ScrollView>
          <View style={styles.modalFooter}>
            <Button title="Reset" variant="ghost" onPress={() => setFilters(resetMutualFundFilters())} />
            <Button title="Apply" variant="customer" onPress={() => setFilterModalOpen(false)} />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <Screen title="Mutual Funds" showBack loading={loading && showCatalog}>
      {!showCatalog ? (
        <ScrollView>
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Grow wealth with the Best Mutual Funds</Text>
            <Text style={styles.heroSub}>500+ funds · Quick, easy & hassle free</Text>
          </View>
          <MutualFundCalculatorCard />
          <MarketplaceProductGrid
            items={MUTUAL_FUND_PRODUCT_GRID}
            onSelect={handleProductSelect}
            title="Choose your investment category"
            subtitle="Select a fund type to get personalised recommendations"
          />
          <Button
            title="View all funds"
            variant="outline"
            onPress={() => {
              if (profile?.verifiedAt) setShowCatalog(true);
              else {
                setPendingProduct({ slug: 'all', label: 'All Mutual Funds', icon: 'stats-chart' });
                setWizardOpen(true);
              }
            }}
            style={{ marginTop: 8 }}
          />
        </ScrollView>
      ) : (
        <>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Mutual Fund Marketplace</Text>
        <Text style={styles.heroSub}>
          {profile?.productLabel ? `Funds for ${profile.productLabel}` : 'SIP · Lumpsum · ELSS · Equity · Debt — compare & invest'}
        </Text>
        {profile?.phone ? <Text style={styles.verifiedBadge}>✓ Verified {profile.phone}</Text> : null}
      </View>
      <TouchableOpacity onPress={() => setShowCatalog(false)} style={styles.browseLink}>
        <Text style={styles.browseLinkText}>‹ Browse categories</Text>
      </TouchableOpacity>

      <MutualFundCalculatorCard />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        <TouchableOpacity style={[styles.categoryChip, filters.category === 'all' && styles.categoryChipActive]} onPress={() => updateFilter('category', 'all')}>
          <Text style={[styles.categoryText, filters.category === 'all' && styles.categoryTextActive]}>All</Text>
        </TouchableOpacity>
        {MUTUAL_FUND_CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat.slug} style={[styles.categoryChip, filters.category === cat.slug && styles.categoryChipActive]} onPress={() => updateFilter('category', cat.slug)}>
            <Text style={[styles.categoryText, filters.category === cat.slug && styles.categoryTextActive]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>{funds.length} funds</Text>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterModalOpen(true)}>
          <Ionicons name="options-outline" size={16} color={colors.customer} />
          <Text style={styles.filterBtnText}>Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}</Text>
        </TouchableOpacity>
      </View>

      {selected.length >= 2 ? (
        <TouchableOpacity onPress={() => setShowCompare((v) => !v)}>
          <Text style={styles.viewAll}>{showCompare ? 'Hide compare' : 'Compare selected'} ›</Text>
        </TouchableOpacity>
      ) : null}

      {showCompare && compareFunds.length >= 2 ? (
        <MarketplaceCompareView
          title="Mutual fund comparison"
          columns={buildMutualFundCompareColumns(compareFunds as unknown as Record<string, unknown>[])}
          specRows={buildMutualFundSpecRows(compareFunds as unknown as Record<string, unknown>[])}
          onRemove={(id) => setSelected((prev) => prev.filter((x) => x !== id))}
        />
      ) : null}

      {filterModal}

      <FlatList
        data={funds}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.empty}>No funds match your filters.</Text>}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.id);
          return (
            <Card style={isSelected ? styles.selectedCard : undefined}>
              <View style={styles.cardRow}>
                <BankLogo uri={resolveLogo(item)} size={56} style={styles.logo} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardAmc}>{item.amcName}</Text>
                  {item.fundManager ? <Text style={styles.cardManager}>{item.fundManager}</Text> : null}
                  <View style={styles.tagRow}>
                    {(item.categories || []).slice(0, 3).map((slug) => (
                      <View key={slug} style={styles.tag}><Text style={styles.tagText}>{getCategoryLabel(slug)}</Text></View>
                    ))}
                  </View>
                </View>
              </View>
              <Text style={styles.meta}>
                3Y {formatPercent(item.returns3y)} · TER {item.expenseRatio != null ? `${item.expenseRatio}%` : '—'} · AUM {formatAum(item.aumCrores)} · {formatRating(item.rating)}
              </Text>
              {item.riskLevel ? <Text style={styles.risk}>Risk: {getRiskLabel(item.riskLevel)}</Text> : null}
              <View style={styles.serviceRow}>
                {item.supportsSip ? <Text style={styles.servicePill}>SIP</Text> : null}
                {item.supportsLumpsum ? <Text style={styles.servicePill}>Lumpsum</Text> : null}
              </View>
              <View style={styles.footerRow}>
                <TouchableOpacity style={[styles.comparePill, isSelected && styles.comparePillActive]} onPress={() => {
                  setSelected((prev) => {
                    if (prev.includes(item.id)) return prev.filter((x) => x !== item.id);
                    if (prev.length >= MAX_COMPARE) { Alert.alert('Limit', `Compare up to ${MAX_COMPARE} funds.`); return prev; }
                    return [...prev, item.id];
                  });
                }}>
                  <Text style={[styles.comparePillText, isSelected && styles.comparePillTextActive]}>{isSelected ? 'Selected' : 'Compare'}</Text>
                </TouchableOpacity>
                <Button title="Invest" variant="customer" onPress={() => openUrl(item.investUrl)} style={{ flex: 1 }} />
              </View>
            </Card>
          );
        }}
      />
        </>
      )}

      <MarketplaceLeadWizard
        visible={wizardOpen}
        onClose={() => { setWizardOpen(false); setPendingProduct(null); }}
        onComplete={handleWizardComplete}
        marketplaceType="mutual_funds"
        productLabel={pendingProduct?.label}
        productCategory={pendingProduct?.slug}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.customer, borderRadius: 16, padding: 18, marginBottom: 12 },
  heroTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  verifiedBadge: { fontSize: 11, color: '#D1FAE5', marginTop: 6, fontWeight: '600' },
  browseLink: { marginBottom: 8 },
  browseLinkText: { fontSize: 13, fontWeight: '700', color: colors.customer },
  categoryScroll: { marginBottom: 12 },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: colors.border, marginRight: 6, backgroundColor: colors.card },
  categoryChipActive: { backgroundColor: colors.customer, borderColor: colors.customer },
  categoryText: { fontSize: 11, fontWeight: '600', color: colors.foreground },
  categoryTextActive: { color: '#fff' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.foreground },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: colors.customer },
  viewAll: { fontSize: 13, fontWeight: '600', color: colors.customer, marginBottom: 8 },
  compareCard: { marginBottom: 12 },
  compareTitle: { fontWeight: '700', marginBottom: 8 },
  compareRow: { flexDirection: 'row', gap: 12, marginBottom: 6 },
  compareLabel: { width: 120, fontSize: 11, fontWeight: '600', color: colors.mutedForeground },
  compareCell: { width: 100, fontSize: 11, color: colors.foreground },
  cardRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  logo: { borderRadius: 10 },
  cardName: { fontWeight: '700', fontSize: 15, color: colors.foreground },
  cardAmc: { fontSize: 12, color: colors.mutedForeground },
  cardManager: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  tag: { backgroundColor: colors.muted, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontSize: 10, color: colors.mutedForeground, fontWeight: '600' },
  meta: { fontSize: 12, color: colors.mutedForeground, marginBottom: 4 },
  risk: { fontSize: 11, fontWeight: '600', color: colors.customer, marginBottom: 8 },
  serviceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  servicePill: { fontSize: 10, fontWeight: '700', color: colors.customer, backgroundColor: `${colors.customer}15`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  footerRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  comparePill: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 },
  comparePillActive: { backgroundColor: colors.customer, borderColor: colors.customer },
  comparePillText: { fontSize: 12, fontWeight: '600', color: colors.mutedForeground },
  comparePillTextActive: { color: '#fff' },
  selectedCard: { borderColor: colors.customer, borderWidth: 2 },
  empty: { textAlign: 'center', color: colors.mutedForeground, paddingVertical: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: 17, fontWeight: '800' },
  modalBody: { padding: 16 },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  filterLabel: { fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 8 },
  searchInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  filterChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 6, alignSelf: 'flex-start' },
  filterChipActive: { backgroundColor: colors.customer, borderColor: colors.customer },
  filterChipText: { fontSize: 12 },
  filterChipTextActive: { color: '#fff', fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  switchLabel: { fontSize: 14, flex: 1 },
});
