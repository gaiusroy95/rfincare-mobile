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
import { colors } from '@/src/theme';
import { creditCardService, type CreditCard } from '@/src/services/creditCardService';

const MAX_COMPARE = 3;

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

  const renderCompareSection = () => {
    if (!showCompare || compareCards.length < 2) return null;
    return (
      <Card style={styles.compareCard}>
        <Text style={styles.compareTitle}>Comparison</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {compareCards.map((card) => (
            <View key={card.id} style={styles.compareCol}>
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
      <Text style={styles.subtitle}>Select up to {MAX_COMPARE} cards to compare features and charges.</Text>

      {selected.length > 0 ? (
        <View style={styles.toolbar}>
          <Text style={styles.toolbarText}>{selected.length} selected</Text>
          <Button
            title="Compare"
            variant="customer"
            onPress={() => setShowCompare(true)}
            disabled={selected.length < 2}
          />
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
          return (
            <Card style={isSelected ? styles.selectedCard : undefined}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardBank}>{item.bankName}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.comparePill, isSelected && styles.comparePillActive]}
                  onPress={() => toggleSelect(item.id)}
                >
                  <Text style={[styles.comparePillText, isSelected && styles.comparePillTextActive]}>
                    {isSelected ? 'Selected' : 'Compare'}
                  </Text>
                </TouchableOpacity>
              </View>
              {item.description ? <Text style={styles.desc} numberOfLines={2}>{item.description}</Text> : null}
              <Text style={styles.meta}>
                Annual fee: {formatInr(item.annualFee)} · Joining: {formatInr(item.joiningFee)}
              </Text>
              {(item.features || []).slice(0, 2).map((f) => (
                <Text key={f} style={styles.bullet}>• {f}</Text>
              ))}
              <TouchableOpacity style={styles.applyBtn} onPress={() => openApplyUrl(item.applyUrl)}>
                <Text style={styles.applyBtnText}>Apply on bank site</Text>
                <Ionicons name="open-outline" size={14} color={colors.primary} />
              </TouchableOpacity>
            </Card>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.mutedForeground, marginBottom: 12, fontSize: 14 },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  toolbarText: { flex: 1, fontWeight: '600', color: colors.foreground },
  compareCard: { marginBottom: 12 },
  compareTitle: { fontWeight: '700', fontSize: 16, marginBottom: 10, color: colors.foreground },
  compareCol: { width: 220, marginRight: 12, paddingRight: 12, borderRightWidth: 1, borderRightColor: colors.border },
  compareName: { fontWeight: '700', color: colors.foreground },
  compareBank: { color: colors.mutedForeground, fontSize: 12, marginBottom: 8 },
  compareLine: { fontSize: 12, color: colors.foreground, marginBottom: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  cardName: { fontWeight: '700', fontSize: 16, color: colors.foreground },
  cardBank: { color: colors.mutedForeground, fontSize: 13 },
  desc: { color: colors.mutedForeground, fontSize: 13, marginBottom: 6 },
  meta: { fontSize: 12, color: colors.mutedForeground, marginBottom: 6 },
  bullet: { fontSize: 12, color: colors.foreground, marginBottom: 2 },
  comparePill: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  comparePillActive: { backgroundColor: colors.customer, borderColor: colors.customer },
  comparePillText: { fontSize: 11, fontWeight: '600', color: colors.mutedForeground },
  comparePillTextActive: { color: '#fff' },
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
