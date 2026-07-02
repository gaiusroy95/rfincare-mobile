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
import { insuranceService, type InsuranceProduct } from '@/src/services/insuranceService';
import {
  DEFAULT_INSURANCE_FILTERS,
  INSURANCE_SEGMENTS,
  INSURANCE_SERVICES,
  PREMIUM_FILTER_OPTIONS,
  SUM_INSURED_FILTER_OPTIONS,
  getCategoriesForSegment,
  getCategoryLabel,
  getSegmentLabel,
  type InsuranceFilters,
} from '@/src/constants/insuranceMarketplace';
import {
  buildInsuranceCompareColumns,
  buildInsuranceSpecRows,
} from '@/src/utils/marketplaceCompareHelpers';
import MarketplaceCompareView from '@/src/components/marketplace/MarketplaceCompareView';
import {
  countActiveFilters,
  formatPremiumRange,
  formatSumInsuredRange,
  getServiceUrl,
  resetInsuranceFilters,
} from '@/src/utils/insuranceFilters';
// @ts-expect-error JS module
import { resolveBankLogoUrl } from '@/src/utils/bankBranding';
import MarketplaceProductGrid from '@/src/components/marketplace/MarketplaceProductGrid';
import MarketplaceLeadWizard from '@/src/components/marketplace/MarketplaceLeadWizard';
import { INSURANCE_PRODUCT_GRID, type MarketplaceProductItem } from '@/src/constants/marketplaceLeadFlow';
import {
  loadMarketplaceProfile,
  saveMarketplaceProfile,
  type MarketplaceProfile,
} from '@/src/utils/marketplaceLeadSession';

const MAX_COMPARE = 3;

function resolveLogo(product: InsuranceProduct) {
  return resolveBankLogoUrl(product?.logoUrl) || null;
}

async function openUrl(url?: string | null) {
  if (!url) {
    Alert.alert('Link unavailable', 'This service link is not available yet.');
    return;
  }
  try {
    if (await Linking.canOpenURL(url)) await Linking.openURL(url);
    else Alert.alert('Cannot open link');
  } catch {
    Alert.alert('Cannot open link');
  }
}

export default function InsuranceMarketplaceScreen() {
  const [profile, setProfile] = useState<MarketplaceProfile | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<MarketplaceProductItem | null>(null);
  const [products, setProducts] = useState<InsuranceProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<InsuranceFilters>({ ...DEFAULT_INSURANCE_FILTERS });

  useEffect(() => {
    loadMarketplaceProfile('insurance').then((saved) => {
      if (saved) {
        setProfile(saved);
        setShowCatalog(true);
        setFilters((prev) => ({
          ...prev,
          segment: saved.productSegment && saved.productSegment !== 'all' ? saved.productSegment : prev.segment,
          category: saved.productCategory && saved.productCategory !== 'all' ? saved.productCategory : prev.category,
        }));
      }
    });
  }, []);

  const loadProducts = useCallback(async () => {
    if (!showCatalog) return;
    setLoading(true);
    try {
      const list = await insuranceService.listActive(filters);
      setProducts(Array.isArray(list) ? list : []);
    } catch {
      setProducts([]);
    }
    setLoading(false);
  }, [filters, showCatalog]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleProductSelect = (item: MarketplaceProductItem) => {
    if (profile?.verifiedAt) {
      setFilters((prev) => ({
        ...prev,
        segment: item.segment || prev.segment,
        category: item.slug,
      }));
      setShowCatalog(true);
      return;
    }
    setPendingProduct(item);
    setWizardOpen(true);
  };

  const handleWizardComplete = async (completed: MarketplaceProfile) => {
    const saved = await saveMarketplaceProfile('insurance', {
      ...completed,
      productCategory: pendingProduct?.slug || completed.productCategory,
      productSegment: pendingProduct?.segment || completed.productSegment,
      productLabel: pendingProduct?.label || completed.productLabel,
    });
    setProfile(saved);
    setFilters((prev) => ({
      ...prev,
      segment: saved.productSegment && saved.productSegment !== 'all' ? saved.productSegment : prev.segment,
      category: saved.productCategory && saved.productCategory !== 'all' ? saved.productCategory : prev.category,
    }));
    setWizardOpen(false);
    setPendingProduct(null);
    setShowCatalog(true);
  };

  const compareProducts = useMemo(
    () => products.filter((p) => selected.includes(p.id)),
    [products, selected],
  );

  const categories = getCategoriesForSegment(filters.segment === 'all' ? null : filters.segment);
  const activeService = filters.service !== 'all' ? filters.service : 'new_policy';
  const activeFilterCount = countActiveFilters(filters);

  const updateFilter = <K extends keyof InsuranceFilters>(key: K, value: InsuranceFilters[K]) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'segment') next.category = 'all';
      return next;
    });
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
            <TextInput style={styles.searchInput} placeholder="Insurer or plan..." value={filters.search} onChangeText={(v) => updateFilter('search', v)} />
            <Text style={styles.filterLabel}>Premium</Text>
            {PREMIUM_FILTER_OPTIONS.map((opt) => (
              <TouchableOpacity key={opt.value} style={[styles.filterChip, filters.premium === opt.value && styles.filterChipActive]} onPress={() => updateFilter('premium', opt.value)}>
                <Text style={[styles.filterChipText, filters.premium === opt.value && styles.filterChipTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.filterLabel}>Sum insured</Text>
            {SUM_INSURED_FILTER_OPTIONS.map((opt) => (
              <TouchableOpacity key={opt.value} style={[styles.filterChip, filters.sumInsured === opt.value && styles.filterChipActive]} onPress={() => updateFilter('sumInsured', opt.value)}>
                <Text style={[styles.filterChipText, filters.sumInsured === opt.value && styles.filterChipTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.switchRow}><Text style={styles.switchLabel}>Tax benefit 80C</Text><Switch value={filters.taxBenefit80c} onValueChange={(v) => updateFilter('taxBenefit80c', v)} /></View>
            <View style={styles.switchRow}><Text style={styles.switchLabel}>Tax benefit 80D</Text><Switch value={filters.taxBenefit80d} onValueChange={(v) => updateFilter('taxBenefit80d', v)} /></View>
          </ScrollView>
          <View style={styles.modalFooter}>
            <Button title="Reset" variant="ghost" onPress={() => setFilters(resetInsuranceFilters())} />
            <Button title="Apply" variant="customer" onPress={() => setFilterModalOpen(false)} />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <Screen title="Insurance" showBack loading={loading && showCatalog}>
      {!showCatalog ? (
        <ScrollView>
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Let&apos;s find you the Best Insurance</Text>
            <Text style={styles.heroSub}>50+ insurers · Quick, easy & hassle free</Text>
          </View>
          <MarketplaceProductGrid
            items={INSURANCE_PRODUCT_GRID}
            onSelect={handleProductSelect}
            title="Choose your insurance product"
            subtitle="Select a category to get personalised quotes"
          />
          <Button
            title="View all products"
            variant="outline"
            onPress={() => {
              if (profile?.verifiedAt) setShowCatalog(true);
              else {
                setPendingProduct({ slug: 'all', label: 'All Insurance Products', icon: 'shield' });
                setWizardOpen(true);
              }
            }}
            style={{ marginTop: 8 }}
          />
        </ScrollView>
      ) : (
        <>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Insurance Marketplace</Text>
        <Text style={styles.heroSub}>
          {profile?.productLabel ? `Plans for ${profile.productLabel}` : 'Life · Health · Motor — compare, renew & claim help'}
        </Text>
        {profile?.phone ? (
          <Text style={styles.verifiedBadge}>✓ Verified {profile.phone}</Text>
        ) : null}
      </View>
      <TouchableOpacity onPress={() => setShowCatalog(false)} style={styles.browseLink}>
        <Text style={styles.browseLinkText}>‹ Browse categories</Text>
      </TouchableOpacity>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.segmentScroll}>
        <TouchableOpacity style={[styles.segmentChip, filters.segment === 'all' && styles.segmentChipActive]} onPress={() => updateFilter('segment', 'all')}>
          <Text style={[styles.segmentText, filters.segment === 'all' && styles.segmentTextActive]}>All</Text>
        </TouchableOpacity>
        {INSURANCE_SEGMENTS.map((seg) => (
          <TouchableOpacity key={seg.slug} style={[styles.segmentChip, filters.segment === seg.slug && styles.segmentChipActive]} onPress={() => updateFilter('segment', seg.slug)}>
            <Text style={[styles.segmentText, filters.segment === seg.slug && styles.segmentTextActive]}>{seg.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        <TouchableOpacity style={[styles.categoryChip, filters.category === 'all' && styles.categoryChipActive]} onPress={() => updateFilter('category', 'all')}>
          <Text style={[styles.categoryText, filters.category === 'all' && styles.categoryTextActive]}>All types</Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity key={cat.slug} style={[styles.categoryChip, filters.category === cat.slug && styles.categoryChipActive]} onPress={() => updateFilter('category', cat.slug)}>
            <Text style={[styles.categoryText, filters.category === cat.slug && styles.categoryTextActive]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.serviceScroll}>
        {INSURANCE_SERVICES.map((svc) => (
          <TouchableOpacity key={svc.slug} style={[styles.serviceChip, filters.service === svc.slug && styles.serviceChipActive]} onPress={() => updateFilter('service', filters.service === svc.slug ? 'all' : svc.slug)}>
            <Text style={[styles.serviceText, filters.service === svc.slug && styles.serviceTextActive]}>{svc.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>{products.length} plans</Text>
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

      {showCompare && compareProducts.length >= 2 ? (
        <MarketplaceCompareView
          title="Insurance plan comparison"
          columns={buildInsuranceCompareColumns(compareProducts as unknown as Record<string, unknown>[], activeService)}
          specRows={buildInsuranceSpecRows(compareProducts as unknown as Record<string, unknown>[])}
          onRemove={(id) => setSelected((prev) => prev.filter((x) => x !== id))}
        />
      ) : null}

      {filterModal}

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.empty}>No plans match your filters.</Text>}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.id);
          const actionUrl = getServiceUrl(item, activeService);
          return (
            <Card style={isSelected ? styles.selectedCard : undefined}>
              <View style={styles.cardRow}>
                <BankLogo uri={resolveLogo(item)} size={56} style={styles.logo} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardInsurer}>{item.insurerName}</Text>
                  <Text style={styles.cardSegment}>{getSegmentLabel(item.segment)}</Text>
                  <View style={styles.tagRow}>
                    {(item.categories || []).slice(0, 2).map((slug) => (
                      <View key={slug} style={styles.tag}><Text style={styles.tagText}>{getCategoryLabel(slug)}</Text></View>
                    ))}
                  </View>
                </View>
              </View>
              <Text style={styles.meta}>{formatPremiumRange(item)} · Cover {formatSumInsuredRange(item)}</Text>
              <View style={styles.serviceRow}>
                {item.supportsNewPolicy ? <Text style={styles.servicePill}>New Policy</Text> : null}
                {item.supportsRenewal ? <Text style={styles.servicePill}>Renewal</Text> : null}
                {item.supportsClaimAssistance ? <Text style={styles.servicePill}>Claim Help</Text> : null}
              </View>
              <View style={styles.footerRow}>
                <TouchableOpacity style={[styles.comparePill, isSelected && styles.comparePillActive]} onPress={() => {
                  setSelected((prev) => {
                    if (prev.includes(item.id)) return prev.filter((x) => x !== item.id);
                    if (prev.length >= MAX_COMPARE) { Alert.alert('Limit', `Compare up to ${MAX_COMPARE} plans.`); return prev; }
                    return [...prev, item.id];
                  });
                }}>
                  <Text style={[styles.comparePillText, isSelected && styles.comparePillTextActive]}>{isSelected ? 'Selected' : 'Compare'}</Text>
                </TouchableOpacity>
                <Button title="Get Started" variant="customer" onPress={() => openUrl(actionUrl)} style={{ flex: 1 }} />
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
        marketplaceType="insurance"
        productLabel={pendingProduct?.label}
        productCategory={pendingProduct?.slug}
        productSegment={pendingProduct?.segment}
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
  segmentScroll: { marginBottom: 8 },
  segmentChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.border, marginRight: 8, backgroundColor: colors.card },
  segmentChipActive: { backgroundColor: colors.customer, borderColor: colors.customer },
  segmentText: { fontSize: 12, fontWeight: '700', color: colors.foreground },
  segmentTextActive: { color: '#fff' },
  categoryScroll: { marginBottom: 8 },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: colors.border, marginRight: 6 },
  categoryChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryText: { fontSize: 11, fontWeight: '600', color: colors.foreground },
  categoryTextActive: { color: '#fff' },
  serviceScroll: { marginBottom: 12 },
  serviceChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: colors.border, marginRight: 6 },
  serviceChipActive: { backgroundColor: '#DBEAFE', borderColor: '#2563EB' },
  serviceText: { fontSize: 11, fontWeight: '600', color: colors.foreground },
  serviceTextActive: { color: '#1D4ED8' },
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
  cardInsurer: { fontSize: 12, color: colors.mutedForeground },
  cardSegment: { fontSize: 10, fontWeight: '700', color: colors.customer, marginTop: 2 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  tag: { backgroundColor: colors.muted, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontSize: 10, color: colors.mutedForeground, fontWeight: '600' },
  meta: { fontSize: 12, color: colors.mutedForeground, marginBottom: 8 },
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
