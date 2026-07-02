import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Linking,
  ScrollView,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@/src/components/Screen';
import Card from '@/src/components/Card';
import Button from '@/src/components/Button';
import BankLogo from '@/src/components/BankLogo';
import MarketplaceLeadWizard from '@/src/components/marketplace/MarketplaceLeadWizard';
import { colors } from '@/src/theme';
import { creditCardService, type CreditCard } from '@/src/services/creditCardService';
import {
  ANNUAL_FEE_FILTER_OPTIONS,
  BENEFIT_FILTER_OPTIONS,
  COMPARE_TABLE_ROWS,
  CREDIT_CARD_CATEGORIES,
  DEFAULT_CREDIT_CARD_FILTERS,
  FOREX_CHARGES_FILTER_OPTIONS,
  JOINING_FEE_FILTER_OPTIONS,
  getCategoryLabel,
  type CreditCardFilters,
} from '@/src/constants/creditCardMarketplace';
import {
  countActiveFilters,
  formatCompareCell,
  formatCardFee,
  resetCreditCardFilters,
} from '@/src/utils/creditCardFilters';
import { completeCreditCardApply } from '@/src/utils/creditCardApplyFlow';
import {
  loadMarketplaceProfile,
  saveMarketplaceProfile,
  type MarketplaceProfile,
} from '@/src/utils/marketplaceLeadSession';
// @ts-expect-error JS module
import { resolveBankLogoUrl, getKnownBankLogoUrl } from '@/src/utils/bankBranding';

const MAX_COMPARE = 3;

function resolveCardLogo(card: CreditCard): string | null {
  return resolveBankLogoUrl(card?.logoUrl) || getKnownBankLogoUrl({ name: card?.bankName }) || null;
}

async function openApplyUrl(url?: string | null) {
  if (!url) {
    Alert.alert('Apply link unavailable', 'This card does not have a bank apply link yet.');
    return;
  }
  try {
    const ok = await Linking.canOpenURL(url);
    if (ok) await Linking.openURL(url);
    else Alert.alert('Cannot open link', 'This apply link is not available.');
  } catch {
    Alert.alert('Cannot open link', 'This apply link is not available.');
  }
}

function FilterOptionRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.filterOption, selected && styles.filterOptionActive]} onPress={onPress}>
      <Text style={[styles.filterOptionText, selected && styles.filterOptionTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function CreditCardsScreen() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [filters, setFilters] = useState<CreditCardFilters>({ ...DEFAULT_CREDIT_CARD_FILTERS });
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [profile, setProfile] = useState<MarketplaceProfile | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [pendingCard, setPendingCard] = useState<CreditCard | null>(null);

  useEffect(() => {
    loadMarketplaceProfile('credit_card').then(setProfile);
  }, []);

  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const list = await creditCardService.listActive(filters);
      setCards(Array.isArray(list) ? list : []);
    } catch {
      setCards([]);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const compareCards = useMemo(
    () => cards.filter((c) => selected.includes(c.id)),
    [cards, selected],
  );

  const activeFilterCount = countActiveFilters(filters);

  const handleCreditCardApply = useCallback(async (card: CreditCard) => {
    if (!card.applyUrl) {
      await openApplyUrl(null);
      return;
    }

    const activeProfile = profile || await loadMarketplaceProfile('credit_card');
    if (!activeProfile?.verifiedAt) {
      setPendingCard(card);
      setWizardOpen(true);
      return;
    }

    await completeCreditCardApply(card, activeProfile);
  }, [profile]);

  const handleWizardComplete = useCallback(async (completedProfile: MarketplaceProfile) => {
    const saved = await saveMarketplaceProfile('credit_card', {
      ...completedProfile,
      productLabel: pendingCard?.name || completedProfile.productLabel,
    });
    setProfile(saved);
    setWizardOpen(false);
    const card = pendingCard;
    setPendingCard(null);
    if (card) {
      await completeCreditCardApply(card, saved);
    }
  }, [pendingCard]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) {
        Alert.alert('Compare limit', `You can compare up to ${MAX_COMPARE} cards at a time.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const updateFilter = <K extends keyof CreditCardFilters>(key: K, value: CreditCardFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const heroBanner = (
    <View style={styles.hero}>
      <View style={{ flex: 1 }}>
        <Text style={styles.heroTitle}>Credit Card Marketplace</Text>
        <Text style={styles.heroSub}>Compare by category, fees, rewards & benefits</Text>
        {profile?.fullName ? (
          <Text style={styles.verifiedBadge}>Verified: {profile.phone} · {profile.email}</Text>
        ) : null}
      </View>
      <Ionicons name="card" size={44} color="rgba(255,255,255,0.9)" style={{ marginLeft: 8 }} />
    </View>
  );

  const categoryBar = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
      <TouchableOpacity
        style={[styles.categoryChip, filters.category === 'all' && styles.categoryChipActive]}
        onPress={() => updateFilter('category', 'all')}
      >
        <Text style={[styles.categoryChipText, filters.category === 'all' && styles.categoryChipTextActive]}>All Cards</Text>
      </TouchableOpacity>
      {CREDIT_CARD_CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat.slug}
          style={[styles.categoryChip, filters.category === cat.slug && styles.categoryChipActive]}
          onPress={() => updateFilter('category', cat.slug)}
        >
          <Text style={[styles.categoryChipText, filters.category === cat.slug && styles.categoryChipTextActive]} numberOfLines={1}>
            {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderCompareSection = () => {
    if (!showCompare || compareCards.length < 2) return null;
    return (
      <Card style={styles.compareCard}>
        <Text style={styles.compareTitle}>Side-by-side comparison</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View>
            <View style={styles.compareHeaderRow}>
              <View style={styles.compareLabelCol}><Text style={styles.compareHeaderLabel}>Attribute</Text></View>
              {compareCards.map((card) => (
                <View key={card.id} style={styles.compareCol}>
                  <BankLogo uri={resolveCardLogo(card)} size={36} style={styles.compareLogo} />
                  <Text style={styles.compareName}>{card.name}</Text>
                  <Text style={styles.compareBank}>{card.bankName}</Text>
                </View>
              ))}
            </View>
            {COMPARE_TABLE_ROWS.map((row) => (
              <View key={row.key} style={styles.compareDataRow}>
                <View style={styles.compareLabelCol}>
                  <Text style={styles.compareRowLabel}>{row.label}</Text>
                </View>
                {compareCards.map((card) => (
                  <View key={card.id} style={styles.compareCol}>
                    <Text style={styles.compareCell}>{formatCompareCell(card, row)}</Text>
                  </View>
                ))}
              </View>
            ))}
            <View style={styles.compareDataRow}>
              <View style={styles.compareLabelCol}><Text style={styles.compareRowLabel}>Apply</Text></View>
              {compareCards.map((card) => (
                <View key={card.id} style={styles.compareCol}>
                  <TouchableOpacity style={styles.applyBtn} onPress={() => handleCreditCardApply(card)}>
                    <Text style={styles.applyBtnText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </Card>
    );
  };

  const filterModal = (
    <Modal visible={filterModalOpen} animationType="slide" transparent onRequestClose={() => setFilterModalOpen(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Compare filters</Text>
            <TouchableOpacity onPress={() => setFilterModalOpen(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.filterSectionTitle}>Search</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Bank or card name..."
              value={filters.search}
              onChangeText={(v) => updateFilter('search', v)}
            />

            <Text style={styles.filterSectionTitle}>Annual fee</Text>
            <View style={styles.filterWrap}>
              {ANNUAL_FEE_FILTER_OPTIONS.map((opt) => (
                <FilterOptionRow
                  key={opt.value}
                  label={opt.label}
                  selected={filters.annualFee === opt.value}
                  onPress={() => updateFilter('annualFee', opt.value)}
                />
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Joining fee</Text>
            <View style={styles.filterWrap}>
              {JOINING_FEE_FILTER_OPTIONS.map((opt) => (
                <FilterOptionRow
                  key={opt.value}
                  label={opt.label}
                  selected={filters.joiningFee === opt.value}
                  onPress={() => updateFilter('joiningFee', opt.value)}
                />
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Forex charges</Text>
            <View style={styles.filterWrap}>
              {FOREX_CHARGES_FILTER_OPTIONS.map((opt) => (
                <FilterOptionRow
                  key={opt.value}
                  label={opt.label}
                  selected={filters.forexCharges === opt.value}
                  onPress={() => updateFilter('forexCharges', opt.value)}
                />
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Benefits & features</Text>
            {BENEFIT_FILTER_OPTIONS.map((opt) => (
              <View key={opt.key} style={styles.switchRow}>
                <Text style={styles.switchLabel}>{opt.label}</Text>
                <Switch
                  value={Boolean(filters[opt.key])}
                  onValueChange={(v) => updateFilter(opt.key, v)}
                  trackColor={{ true: colors.customer }}
                />
              </View>
            ))}
          </ScrollView>
          <View style={styles.modalFooter}>
            <Button title="Reset" variant="ghost" onPress={() => setFilters(resetCreditCardFilters())} />
            <Button title="Apply filters" variant="customer" onPress={() => setFilterModalOpen(false)} />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <Screen title="Credit Cards" showBack loading={loading}>
      {heroBanner}
      {categoryBar}

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>{cards.length} card{cards.length === 1 ? '' : 's'}</Text>
        <View style={styles.sectionActions}>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterModalOpen(true)}>
            <Ionicons name="options-outline" size={16} color={colors.customer} />
            <Text style={styles.filterBtnText}>Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}</Text>
          </TouchableOpacity>
          {selected.length >= 2 ? (
            <TouchableOpacity onPress={() => setShowCompare((v) => !v)}>
              <Text style={styles.viewAll}>{showCompare ? 'Hide compare' : 'Compare'} ›</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {selected.length > 0 ? (
        <View style={styles.toolbar}>
          <Text style={styles.toolbarText}>{selected.length} selected to compare</Text>
          <Button title="Clear" variant="ghost" onPress={() => { setSelected([]); setShowCompare(false); }} />
        </View>
      ) : null}

      {renderCompareSection()}
      {filterModal}

      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.empty}>No credit cards match your filters.</Text>
            <Button title="Reset filters" variant="outline" onPress={() => setFilters(resetCreditCardFilters())} />
          </View>
        }
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.id);
          const lifetimeFree = Number(item.annualFee) === 0;
          const bullets = [...(item.features || []), ...(item.benefits || [])].filter(Boolean).slice(0, 3);
          return (
            <Card style={isSelected ? styles.selectedCard : undefined}>
              <View style={styles.cardRow}>
                <BankLogo uri={resolveCardLogo(item)} size={64} style={styles.logo} />
                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
                    {lifetimeFree ? (
                      <View style={styles.freeBadge}>
                        <Text style={styles.freeBadgeText}>LIFETIME FREE</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.cardBank}>{item.bankName}</Text>
                  {(item.categories || []).length > 0 ? (
                    <View style={styles.tagRow}>
                      {(item.categories || []).slice(0, 2).map((slug) => (
                        <View key={slug} style={styles.tag}>
                          <Text style={styles.tagText}>{getCategoryLabel(slug)}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                  {bullets.length ? (
                    <View style={styles.bullets}>
                      {bullets.map((f) => (
                        <View key={f} style={styles.bulletRow}>
                          <Ionicons name="checkmark-circle" size={13} color={colors.success} />
                          <Text style={styles.bulletText} numberOfLines={1}>{f}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>

              <Text style={styles.meta}>
                Annual: {formatCardFee(item.annualFee)} · Joining: {formatCardFee(item.joiningFee)}
                {item.rewardPoints ? ` · ${item.rewardPoints}` : ''}
              </Text>

              <View style={styles.benefitRow}>
                {item.loungeAccess ? <Text style={styles.benefitPill}>Lounge</Text> : null}
                {item.fuelSurchargeWaiver ? <Text style={styles.benefitPill}>Fuel waiver</Text> : null}
                {item.emiConversion ? <Text style={styles.benefitPill}>EMI</Text> : null}
              </View>

              <View style={styles.footerRow}>
                <TouchableOpacity
                  style={[styles.comparePill, isSelected && styles.comparePillActive]}
                  onPress={() => toggleSelect(item.id)}
                >
                  <Ionicons name={isSelected ? 'checkbox' : 'square-outline'} size={15} color={isSelected ? '#fff' : colors.customer} />
                  <Text style={[styles.comparePillText, isSelected && styles.comparePillTextActive]}>
                    {isSelected ? 'Selected' : 'Compare'}
                  </Text>
                </TouchableOpacity>
                <Button title="Apply Now" variant="customer" onPress={() => handleCreditCardApply(item)} style={styles.applyNowBtn} />
              </View>
            </Card>
          );
        }}
      />
      <MarketplaceLeadWizard
        visible={wizardOpen}
        onClose={() => { setWizardOpen(false); setPendingCard(null); }}
        onComplete={handleWizardComplete}
        marketplaceType="credit_card"
        productLabel={pendingCard?.name}
        productCategory={pendingCard?.categories?.[0]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.customer,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  heroTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  verifiedBadge: { fontSize: 11, color: '#D1FAE5', marginTop: 6, fontWeight: '600' },
  categoryScroll: { marginBottom: 12 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    backgroundColor: colors.card,
  },
  categoryChipActive: { backgroundColor: colors.customer, borderColor: colors.customer },
  categoryChipText: { fontSize: 12, fontWeight: '600', color: colors.foreground },
  categoryChipTextActive: { color: '#fff' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.foreground },
  sectionActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: colors.customer },
  viewAll: { fontSize: 13, fontWeight: '600', color: colors.customer },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  toolbarText: { flex: 1, fontWeight: '600', color: colors.foreground, fontSize: 13 },
  compareCard: { marginBottom: 12 },
  compareTitle: { fontWeight: '700', fontSize: 16, marginBottom: 10, color: colors.foreground },
  compareHeaderRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 8 },
  compareDataRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 8 },
  compareLabelCol: { width: 120, paddingRight: 8 },
  compareCol: { width: 160, paddingRight: 12 },
  compareHeaderLabel: { fontWeight: '700', fontSize: 12, color: colors.mutedForeground },
  compareRowLabel: { fontSize: 12, fontWeight: '600', color: colors.mutedForeground },
  compareCell: { fontSize: 12, color: colors.foreground },
  compareName: { fontWeight: '700', color: colors.foreground, fontSize: 13 },
  compareBank: { color: colors.mutedForeground, fontSize: 11, marginBottom: 4 },
  compareLogo: { borderRadius: 8, marginBottom: 6 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  logo: { borderRadius: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  cardName: { fontWeight: '700', fontSize: 15, color: colors.foreground, flex: 1 },
  cardBank: { color: colors.mutedForeground, fontSize: 12, marginTop: 1 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  tag: { backgroundColor: colors.muted, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontSize: 10, color: colors.mutedForeground, fontWeight: '600' },
  freeBadge: { backgroundColor: '#DCFCE7', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  freeBadgeText: { fontSize: 9, fontWeight: '800', color: '#15803D' },
  bullets: { marginTop: 8, gap: 3 },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bulletText: { fontSize: 12, color: colors.foreground, flex: 1 },
  meta: { fontSize: 12, color: colors.mutedForeground, marginBottom: 8 },
  benefitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  benefitPill: { fontSize: 10, fontWeight: '700', color: colors.customer, backgroundColor: `${colors.customer}15`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  comparePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  comparePillActive: { backgroundColor: colors.customer, borderColor: colors.customer },
  comparePillText: { fontSize: 12, fontWeight: '600', color: colors.mutedForeground },
  comparePillTextActive: { color: '#fff' },
  applyNowBtn: { flex: 1 },
  selectedCard: { borderColor: colors.customer, borderWidth: 2 },
  applyBtn: {
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  applyBtnText: { fontWeight: '700', color: colors.primary, fontSize: 12 },
  emptyWrap: { alignItems: 'center', gap: 12, paddingVertical: 24 },
  empty: { textAlign: 'center', color: colors.mutedForeground },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '88%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: 17, fontWeight: '800', color: colors.foreground },
  modalBody: { padding: 16 },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  filterSectionTitle: { fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 8, marginTop: 12 },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.foreground,
    backgroundColor: colors.background,
  },
  filterWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterOption: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  filterOptionActive: { backgroundColor: colors.customer, borderColor: colors.customer },
  filterOptionText: { fontSize: 12, color: colors.foreground },
  filterOptionTextActive: { color: '#fff', fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  switchLabel: { fontSize: 14, color: colors.foreground, flex: 1, paddingRight: 12 },
});
