import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Linking,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@/src/components/Screen';
import Card from '@/src/components/Card';
import Button from '@/src/components/Button';
import BankLogo from '@/src/components/BankLogo';
import { colors } from '@/src/theme';
import { creditCardService, type CreditCard } from '@/src/services/creditCardService';
// @ts-expect-error JS module
import { resolveBankLogoUrl, getKnownBankLogoUrl } from '@/src/utils/bankBranding';

const MAX_COMPARE = 3;

/** Mirror web: prefer the card's own logo, fall back to the issuing bank's known logo. */
function resolveCardLogo(card: CreditCard): string | null {
  return resolveBankLogoUrl(card?.logoUrl) || getKnownBankLogoUrl({ name: card?.bankName }) || null;
}

function formatInr(value?: number | null) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  if (n === 0) return 'Free';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
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

export default function CreditCardsScreen() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    creditCardService
      .listActive()
      .then((list) => setCards(Array.isArray(list) ? list : []))
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  }, []);

  const compareCards = useMemo(
    () => cards.filter((c) => selected.includes(c.id)),
    [cards, selected],
  );

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

  const showDetails = (card: CreditCard) => {
    const lines = [
      card.description || '',
      `Annual fee: ${formatInr(card.annualFee)}`,
      `Joining fee: ${formatInr(card.joiningFee)}`,
      card.interestRate != null ? `Interest: ${card.interestRate}%` : '',
      card.cardNetwork ? `Network: ${card.cardNetwork}` : '',
      ...(card.features || []).map((f) => `• ${f}`),
      ...(card.benefits || []).map((b) => `• ${b}`),
    ].filter(Boolean).join('\n');
    Alert.alert(card.name, lines || 'No additional details available.');
  };

  const heroBanner = (
    <View style={styles.hero}>
      <View style={{ flex: 1 }}>
        <Text style={styles.heroTitle}>Exclusive Credit Card Offers</Text>
        <Text style={styles.heroSub}>Apply now and get exciting benefits</Text>
        <View style={styles.heroChips}>
          {['Instant Approval', 'Best In Class Rewards', 'Lifetime Free Options'].map((t) => (
            <View key={t} style={styles.heroChip}>
              <Ionicons name="checkmark-circle" size={13} color="#fff" />
              <Text style={styles.heroChipText}>{t}</Text>
            </View>
          ))}
        </View>
      </View>
      <Ionicons name="card" size={44} color="rgba(255,255,255,0.9)" style={{ marginLeft: 8 }} />
    </View>
  );

  const renderCompareSection = () => {
    if (!showCompare || compareCards.length < 2) return null;
    return (
      <Card style={styles.compareCard}>
        <Text style={styles.compareTitle}>Comparison</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {compareCards.map((card) => (
            <View key={card.id} style={styles.compareCol}>
              <BankLogo uri={resolveCardLogo(card)} size={40} style={styles.compareLogo} />
              <Text style={styles.compareName}>{card.name}</Text>
              <Text style={styles.compareBank}>{card.bankName}</Text>
              <Text style={styles.compareLine}>Annual fee: {formatInr(card.annualFee)}</Text>
              <Text style={styles.compareLine}>Joining: {formatInr(card.joiningFee)}</Text>
              <Text style={styles.compareLine}>
                Interest: {card.interestRate != null ? `${card.interestRate}%` : '—'}
              </Text>
              {(card.features || []).slice(0, 3).map((f) => (
                <Text key={f} style={styles.bullet}>• {f}</Text>
              ))}
              {(card.benefits || []).slice(0, 2).map((b) => (
                <Text key={b} style={styles.bullet}>• {b}</Text>
              ))}
              <TouchableOpacity style={styles.applyBtn} onPress={() => openApplyUrl(card.applyUrl)}>
                <Text style={styles.applyBtnText}>Apply</Text>
                <Ionicons name="open-outline" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </Card>
    );
  };

  return (
    <Screen title="Credit Cards" showBack loading={loading}>
      {heroBanner}

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Top Credit Card Offers</Text>
        {selected.length >= 2 ? (
          <TouchableOpacity onPress={() => setShowCompare((v) => !v)}>
            <Text style={styles.viewAll}>{showCompare ? 'Hide compare' : 'Compare'} ›</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {selected.length > 0 ? (
        <View style={styles.toolbar}>
          <Text style={styles.toolbarText}>{selected.length} selected to compare</Text>
          <Button title="Clear" variant="ghost" onPress={() => { setSelected([]); setShowCompare(false); }} />
        </View>
      ) : null}

      {renderCompareSection()}

      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.empty}>No credit cards available yet.</Text>}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.id);
          const lifetimeFree = Number(item.annualFee) === 0;
          const bullets = [
            ...(item.features || []),
            ...(item.benefits || []),
          ].filter(Boolean).slice(0, 3);
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
                Annual fee: {formatInr(item.annualFee)} · Joining: {formatInr(item.joiningFee)}
              </Text>

              <View style={styles.footerRow}>
                <TouchableOpacity
                  style={[styles.comparePill, isSelected && styles.comparePillActive]}
                  onPress={() => toggleSelect(item.id)}
                >
                  <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={15}
                    color={isSelected ? '#fff' : colors.customer}
                  />
                  <Text style={[styles.comparePillText, isSelected && styles.comparePillTextActive]}>
                    {isSelected ? 'Selected' : 'Compare'}
                  </Text>
                </TouchableOpacity>
                <Button
                  title="Apply Now"
                  variant="customer"
                  onPress={() => openApplyUrl(item.applyUrl)}
                  style={styles.applyNowBtn}
                />
              </View>

              <TouchableOpacity style={styles.detailsLink} onPress={() => showDetails(item)}>
                <Text style={styles.detailsText}>View Details</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.customer} />
              </TouchableOpacity>
            </Card>
          );
        }}
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
    marginBottom: 16,
  },
  heroTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4, marginBottom: 10 },
  heroChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  heroChipText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.foreground },
  viewAll: { fontSize: 13, fontWeight: '600', color: colors.customer },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  toolbarText: { flex: 1, fontWeight: '600', color: colors.foreground, fontSize: 13 },
  compareCard: { marginBottom: 12 },
  compareTitle: { fontWeight: '700', fontSize: 16, marginBottom: 10, color: colors.foreground },
  compareCol: { width: 220, marginRight: 12, paddingRight: 12, borderRightWidth: 1, borderRightColor: colors.border },
  compareName: { fontWeight: '700', color: colors.foreground },
  compareBank: { color: colors.mutedForeground, fontSize: 12, marginBottom: 8 },
  compareLine: { fontSize: 12, color: colors.foreground, marginBottom: 4 },
  compareLogo: { borderRadius: 8, marginBottom: 8 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  logo: { borderRadius: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  cardName: { fontWeight: '700', fontSize: 15, color: colors.foreground, flex: 1 },
  cardBank: { color: colors.mutedForeground, fontSize: 12, marginTop: 1 },
  freeBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  freeBadgeText: { fontSize: 9, fontWeight: '800', color: '#15803D' },
  bullets: { marginTop: 8, gap: 3 },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bulletText: { fontSize: 12, color: colors.foreground, flex: 1 },
  meta: { fontSize: 12, color: colors.mutedForeground, marginBottom: 10 },
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
  detailsLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 10 },
  detailsText: { fontSize: 13, fontWeight: '600', color: colors.customer },
  selectedCard: { borderColor: colors.customer, borderWidth: 2 },
  applyBtn: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  applyBtnText: { fontWeight: '700', color: colors.primary, fontSize: 13 },
  empty: { textAlign: 'center', color: colors.mutedForeground, paddingVertical: 24 },
});
