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
import {
  postOfficeService,
  type PostOfficeProduct,
  type PostOfficeCalculateResult,
} from '@/src/services/postOfficeService';
import {
  DEFAULT_POST_OFFICE_FILTERS,
  POST_OFFICE_CATEGORIES,
  getCategoryLabel,
  type PostOfficeFilters,
} from '@/src/constants/postOfficeMarketplace';
import {
  resetPostOfficeFilters,
  formatInterestRate,
  formatCurrency,
  formatMonths,
} from '@/src/utils/postOfficeFilters';
import MarketplaceProductGrid from '@/src/components/marketplace/MarketplaceProductGrid';
import { POST_OFFICE_PRODUCT_GRID, type MarketplaceProductItem } from '@/src/constants/marketplaceLeadFlow';
import MarketplaceCompareView from '@/src/components/marketplace/MarketplaceCompareView';
import MarketplaceLeadWizard from '@/src/components/marketplace/MarketplaceLeadWizard';
import { buildPostOfficeCompareColumns, buildPostOfficeSpecRows } from '@/src/utils/marketplaceCompareHelpers';
import { completePostOfficeApply } from '@/src/utils/postOfficeApplyFlow';
import {
  loadMarketplaceProfile,
  saveMarketplaceProfile,
  type MarketplaceProfile,
} from '@/src/utils/marketplaceLeadSession';
// @ts-expect-error JS module
import { resolveBankLogoUrl } from '@/src/utils/bankBranding';

const MAX_COMPARE = 3;

const DEFAULT_CALC_INPUTS = {
  calculatorType: 'time_deposit',
  principal: '100000',
  monthlyDeposit: '',
  annualDeposit: '',
  annualRate: '7.1',
  tenureYears: '5',
};

function getDefaultCalcInputs(product?: PostOfficeProduct | null) {
  if (!product) return { ...DEFAULT_CALC_INPUTS };
  const type = product.calculatorType || product.categories?.[0] || 'time_deposit';
  return {
    calculatorType: type,
    principal: product.minDepositAmount != null ? String(product.minDepositAmount) : '100000',
    monthlyDeposit: type === 'recurring_deposit' ? String(product.minDepositAmount ?? 1000) : '',
    annualDeposit: (type === 'ppf' || type === 'sukanya_samriddhi') ? String(product.minDepositAmount ?? 150000) : '',
    annualRate: product.interestRate != null ? String(product.interestRate) : '7.1',
    tenureYears: product.tenureMaxMonths
      ? String(Math.round(Number(product.tenureMaxMonths) / 12))
      : product.tenureMinMonths
        ? String(Math.round(Number(product.tenureMinMonths) / 12))
        : '5',
  };
}

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

export default function PostOfficeMarketplaceScreen() {
  const [products, setProducts] = useState<PostOfficeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calculatorProduct, setCalculatorProduct] = useState<PostOfficeProduct | null>(null);
  const [calcInputs, setCalcInputs] = useState(() => getDefaultCalcInputs());
  const [calcResult, setCalcResult] = useState<PostOfficeCalculateResult | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState('');
  const [filters, setFilters] = useState<PostOfficeFilters>({ ...DEFAULT_POST_OFFICE_FILTERS });
  const [profile, setProfile] = useState<MarketplaceProfile | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<PostOfficeProduct | null>(null);

  useEffect(() => {
    loadMarketplaceProfile('post_office').then(setProfile);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await postOfficeService.listActive(filters);
      setProducts(Array.isArray(list) ? list : []);
    } catch {
      setProducts([]);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!calculatorOpen) return;
    setCalcInputs(getDefaultCalcInputs(calculatorProduct));
    setCalcResult(null);
    setCalcError('');
  }, [calculatorOpen, calculatorProduct]);

  const openCalculator = (product: PostOfficeProduct | null = null) => {
    setCalculatorProduct(product);
    setCalculatorOpen(true);
  };

  const handlePostOfficeApply = useCallback(async (product: PostOfficeProduct) => {
    if (product.applyUrl) {
      const activeProfile = profile || await loadMarketplaceProfile('post_office');
      if (!activeProfile?.verifiedAt) {
        setPendingProduct(product);
        setWizardOpen(true);
        return;
      }
      await completePostOfficeApply(product, activeProfile);
      return;
    }

    if (product.calculatorEnabled !== false) {
      openCalculator(product);
    } else {
      await openUrl(null);
    }
  }, [profile]);

  const handleWizardComplete = useCallback(async (completedProfile: MarketplaceProfile) => {
    const saved = await saveMarketplaceProfile('post_office', {
      ...completedProfile,
      productLabel: pendingProduct?.name || completedProfile.productLabel,
      productCategory: pendingProduct?.categories?.[0] || completedProfile.productCategory,
    });
    setProfile(saved);
    setWizardOpen(false);
    const product = pendingProduct;
    setPendingProduct(null);
    if (product?.applyUrl) {
      await completePostOfficeApply(product, saved);
    }
  }, [pendingProduct]);

  const handleCalculate = async () => {
    setCalcLoading(true);
    setCalcError('');
    try {
      const payload = {
        calculatorType: calcInputs.calculatorType,
        principal: calcInputs.principal !== '' ? Number(calcInputs.principal) : undefined,
        monthlyDeposit: calcInputs.monthlyDeposit !== '' ? Number(calcInputs.monthlyDeposit) : undefined,
        annualDeposit: calcInputs.annualDeposit !== '' ? Number(calcInputs.annualDeposit) : undefined,
        annualRate: calcInputs.annualRate !== '' ? Number(calcInputs.annualRate) : undefined,
        tenureYears: calcInputs.tenureYears !== '' ? Number(calcInputs.tenureYears) : undefined,
      };
      const data = await postOfficeService.calculate(payload);
      setCalcResult(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error
        || (err as { message?: string })?.message
        || 'Calculation failed';
      setCalcError(msg);
      setCalcResult(null);
    }
    setCalcLoading(false);
  };

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
    () => buildPostOfficeCompareColumns(compareProducts as unknown as Record<string, unknown>[]),
    [compareProducts],
  );
  const specRows = useMemo(
    () => buildPostOfficeSpecRows(compareProducts as unknown as Record<string, unknown>[]),
    [compareProducts],
  );

  const calcType = calcInputs.calculatorType;

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
              placeholder="Scheme or product name..."
              value={filters.search}
              onChangeText={(v) => setFilters((prev) => ({ ...prev, search: v }))}
            />
            <Text style={styles.filterHint}>
              Category is controlled by the grid selection. Use Reset to clear everything.
            </Text>
          </View>
          <View style={styles.modalFooter}>
            <Button title="Reset" variant="ghost" onPress={() => setFilters(resetPostOfficeFilters())} />
            <Button title="Apply" variant="customer" onPress={() => setFilterModalOpen(false)} />
          </View>
        </View>
      </View>
    </Modal>
  );

  const calculatorModal = (
    <Modal visible={calculatorOpen} animationType="slide" transparent onRequestClose={() => setCalculatorOpen(false)}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, styles.calcSheet]}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Post Office Calculator</Text>
              <Text style={styles.calcSub}>
                {calculatorProduct?.name ? `Estimate returns for ${calculatorProduct.name}` : 'Estimate maturity value and returns'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setCalculatorOpen(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.calcBody} showsVerticalScrollIndicator={false}>
            {calcError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{calcError}</Text>
              </View>
            ) : null}

            <Text style={styles.filterLabel}>Scheme type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {POST_OFFICE_CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.slug}
                  style={[styles.chip, calcInputs.calculatorType === c.slug && styles.chipActive]}
                  onPress={() => setCalcInputs((prev) => ({ ...prev, calculatorType: c.slug }))}
                >
                  <Text style={[styles.chipText, calcInputs.calculatorType === c.slug && styles.chipTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {(calcType === 'ppf' || calcType === 'sukanya_samriddhi') ? (
              <>
                <Text style={styles.filterLabel}>Annual deposit (₹)</Text>
                <TextInput
                  style={styles.searchInput}
                  keyboardType="numeric"
                  value={calcInputs.annualDeposit}
                  onChangeText={(v) => setCalcInputs((prev) => ({ ...prev, annualDeposit: v }))}
                />
              </>
            ) : calcType === 'recurring_deposit' ? (
              <>
                <Text style={styles.filterLabel}>Monthly deposit (₹)</Text>
                <TextInput
                  style={styles.searchInput}
                  keyboardType="numeric"
                  value={calcInputs.monthlyDeposit}
                  onChangeText={(v) => setCalcInputs((prev) => ({ ...prev, monthlyDeposit: v }))}
                />
              </>
            ) : (
              <>
                <Text style={styles.filterLabel}>Principal / lump sum (₹)</Text>
                <TextInput
                  style={styles.searchInput}
                  keyboardType="numeric"
                  value={calcInputs.principal}
                  onChangeText={(v) => setCalcInputs((prev) => ({ ...prev, principal: v }))}
                />
              </>
            )}

            <Text style={styles.filterLabel}>Interest rate (% p.a.)</Text>
            <TextInput
              style={styles.searchInput}
              keyboardType="numeric"
              value={calcInputs.annualRate}
              onChangeText={(v) => setCalcInputs((prev) => ({ ...prev, annualRate: v }))}
            />

            <Text style={styles.filterLabel}>Tenure (years)</Text>
            <TextInput
              style={styles.searchInput}
              keyboardType="numeric"
              value={calcInputs.tenureYears}
              onChangeText={(v) => setCalcInputs((prev) => ({ ...prev, tenureYears: v }))}
            />

            {calcResult ? (
              <View style={styles.resultBox}>
                {calcResult.summary ? (
                  <Text style={styles.resultSummary}>{calcResult.summary}</Text>
                ) : null}
                <View style={styles.resultMetrics}>
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Maturity</Text>
                    <Text style={styles.metricValue}>{formatCurrency(calcResult.maturityValue)}</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Invested</Text>
                    <Text style={styles.metricValue}>{formatCurrency(calcResult.totalInvested)}</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Returns</Text>
                    <Text style={[styles.metricValue, { color: '#059669' }]}>{formatCurrency(calcResult.returnsAmount)}</Text>
                  </View>
                </View>
                {calcResult.monthlyIncome != null ? (
                  <Text style={styles.monthlyIncome}>
                    Estimated monthly income: {formatCurrency(calcResult.monthlyIncome)}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button title="Close" variant="ghost" onPress={() => setCalculatorOpen(false)} />
            <Button title="Calculate" variant="customer" onPress={handleCalculate} loading={calcLoading} />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <Screen title="Post Office" showBack loading={loading} scroll={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Post Office Marketplace</Text>
          <Text style={styles.heroSub}>
            Compare PPF, NSC, KVP, SCSS, MIS and other India Post savings schemes. Select up to {MAX_COMPARE} to compare.
          </Text>
          {profile?.fullName ? (
            <Text style={styles.verifiedBadge}>Verified: {profile.phone} · {profile.email}</Text>
          ) : null}
          <View style={styles.heroRow}>
            <Button title="Filters" variant="outline" onPress={() => setFilterModalOpen(true)} />
            <Button title="Calculator" variant="outline" onPress={() => openCalculator()} />
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
          items={POST_OFFICE_PRODUCT_GRID}
          onSelect={handleCategorySelect}
          title="Choose a scheme"
          subtitle={filters.category !== 'all' ? `Showing ${getCategoryLabel(filters.category)}` : 'Government-backed post office savings'}
        />

        {showCompare ? (
          <MarketplaceCompareView
            title="Post office comparison"
            columns={columns}
            specRows={specRows}
            onRemove={(id) => setSelected((prev) => prev.filter((x) => x !== id))}
            onCtaPress={(col) => {
              const product = compareProducts.find((p) => p.id === col.id);
              if (product) handlePostOfficeApply(product);
            }}
          />
        ) : null}

        <Text style={styles.hint}>
          Selected {selected.length} of {MAX_COMPARE} — tap cards to add/remove
        </Text>

        {filtered.map((p) => {
          const isSelected = selected.includes(p.id);
          const tenure = p.tenureMaxMonths ?? p.tenureMinMonths;
          return (
            <TouchableOpacity key={p.id} activeOpacity={0.9} onPress={() => toggle(p.id)}>
              <Card style={[styles.card, isSelected && styles.cardSelected]}>
                <View style={styles.cardHead}>
                  <BankLogo uri={resolveBankLogoUrl(p.logoUrl) || undefined} size={44} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.provider} numberOfLines={1}>{p.providerName || 'India Post'}</Text>
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
                    <Text style={styles.metricValue}>{formatInterestRate(p.interestRate)}</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Tenure</Text>
                    <Text style={styles.metricValue}>{formatMonths(tenure)}</Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  {p.calculatorEnabled !== false ? (
                    <Button title="Calculator" variant="outline" onPress={() => openCalculator(p)} style={{ flex: 1 }} />
                  ) : null}
                  <Button title="Apply Now" variant="customer" onPress={() => handlePostOfficeApply(p)} style={{ flex: 1 }} />
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {filterModal}
      {calculatorModal}
      <MarketplaceLeadWizard
        visible={wizardOpen}
        onClose={() => { setWizardOpen(false); setPendingProduct(null); }}
        onComplete={handleWizardComplete}
        marketplaceType="post_office"
        productLabel={pendingProduct?.name}
        productCategory={pendingProduct?.categories?.[0]}
      />
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
  verifiedBadge: { fontSize: 11, color: '#D1FAE5', marginTop: 6, fontWeight: '600' },
  heroRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
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
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 10 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.background, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 14 },
  calcSheet: { maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8 },
  modalTitle: { fontSize: 16, fontWeight: '900', color: colors.foreground },
  calcSub: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  modalBody: { paddingVertical: 10 },
  calcBody: { maxHeight: 420, paddingVertical: 8 },
  modalFooter: { flexDirection: 'row', gap: 10, paddingTop: 8 },
  filterLabel: { fontSize: 12, fontWeight: '900', color: colors.foreground, marginBottom: 6, marginTop: 8 },
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
  chipRow: { marginBottom: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    backgroundColor: colors.card,
  },
  chipActive: { borderColor: colors.customer, backgroundColor: colors.customer + '18' },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.foreground },
  chipTextActive: { color: colors.customer, fontWeight: '800' },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 10, marginBottom: 8 },
  errorText: { color: '#B91C1C', fontSize: 12 },
  resultBox: { marginTop: 12, backgroundColor: '#F8FAFC', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.border },
  resultSummary: { fontSize: 12, color: colors.mutedForeground, marginBottom: 10 },
  resultMetrics: { flexDirection: 'row', gap: 8 },
  monthlyIncome: { fontSize: 12, fontWeight: '700', color: colors.foreground, marginTop: 10 },
});
