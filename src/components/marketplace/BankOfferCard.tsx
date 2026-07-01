import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BankLogo from '@/src/components/BankLogo';
import Button from '@/src/components/Button';
import { colors } from '@/src/theme';

export type BankOfferCardData = {
  id?: string | number;
  compareKey?: string;
  name?: string;
  productName?: string;
  logo?: string | null;
  interestRateLabel?: string;
  interestRate?: number | null;
  probability?: number;
  minAmount?: string | number | null;
  maxAmount?: string | number | null;
  processingFee?: string;
  features?: string[];
  applyUrl?: string | null;
};

async function openApplyUrl(url?: string | null) {
  if (!url) return;
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
    else Alert.alert('Cannot open link', 'This bank application link is not available.');
  } catch {
    Alert.alert('Cannot open link', 'This bank application link is not available.');
  }
}

type Props = {
  offer: BankOfferCardData;
  selected?: boolean;
  onApply: () => void;
  onToggleCompare: () => void;
};

function probabilityColor(p: number): string {
  if (p >= 80) return colors.success;
  if (p >= 60) return colors.warning;
  return colors.destructive;
}

export default function BankOfferCard({ offer, selected, onApply, onToggleCompare }: Props) {
  const probability = offer.probability ?? 0;
  const rate = offer.interestRateLabel ?? (offer.interestRate != null ? `${offer.interestRate}%` : '—');
  const amountRange =
    offer.minAmount && offer.maxAmount
      ? `${offer.minAmount} – ${offer.maxAmount}`
      : offer.maxAmount
        ? `Up to ${offer.maxAmount}`
        : 'Flexible limits';

  return (
    <View style={[styles.card, selected && styles.cardSelected]}>
      {selected ? (
        <View style={styles.selectedBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#fff" />
          <Text style={styles.selectedText}>Selected</Text>
        </View>
      ) : null}

      <View style={styles.header}>
        <BankLogo uri={offer.logo} size={56} style={styles.logoWrap} backgroundColor={colors.muted} />
        <View style={styles.headerText}>
          <Text style={styles.bankName}>{offer.name || 'Bank'}</Text>
          <Text style={styles.product} numberOfLines={2}>{offer.productName}</Text>
        </View>
        <TouchableOpacity
          style={[styles.compareIcon, selected && styles.compareIconActive]}
          onPress={onToggleCompare}
          activeOpacity={0.8}
        >
          <Ionicons
            name={selected ? 'checkbox' : 'square-outline'}
            size={22}
            color={selected ? '#fff' : colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.rateBox}>
        <Text style={styles.rateLabel}>Interest rate</Text>
        <Text style={styles.rateValue}>{rate}</Text>
      </View>

      <View style={[styles.probBox, { backgroundColor: `${probabilityColor(probability)}14` }]}>
        <View style={styles.probHeader}>
          <Text style={styles.probLabel}>Eligibility match</Text>
          <Text style={[styles.probValue, { color: probabilityColor(probability) }]}>{probability}%</Text>
        </View>
        <View style={styles.probTrack}>
          <View
            style={[
              styles.probFill,
              { width: `${Math.min(100, probability)}%`, backgroundColor: probabilityColor(probability) },
            ]}
          />
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaChip}>
          <Ionicons name="cash-outline" size={14} color={colors.primary} />
          <Text style={styles.metaText} numberOfLines={1}>{amountRange}</Text>
        </View>
        {offer.processingFee ? (
          <View style={styles.metaChip}>
            <Ionicons name="receipt-outline" size={14} color={colors.secondary} />
            <Text style={styles.metaText} numberOfLines={1}>{offer.processingFee}</Text>
          </View>
        ) : null}
      </View>

      {(offer.features || []).slice(0, 2).map((f) => (
        <View key={f} style={styles.feature}>
          <Ionicons name="checkmark-circle" size={14} color={colors.success} />
          <Text style={styles.featureText} numberOfLines={1}>{f}</Text>
        </View>
      ))}

      <View style={styles.actions}>
        <Button title="Apply Now" variant="customer" onPress={onApply} style={styles.applyBtn} />
        <Button
          title={selected ? 'Remove' : 'Add to Compare'}
          variant="outline"
          onPress={onToggleCompare}
          style={styles.compareBtn}
        />
      </View>

      {offer.applyUrl ? (
        <TouchableOpacity
          style={styles.externalLink}
          onPress={() => openApplyUrl(offer.applyUrl)}
          activeOpacity={0.7}
        >
          <Ionicons name="open-outline" size={15} color={colors.primary} />
          <Text style={styles.externalLinkText}>Apply on {offer.name || 'bank'} website</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: colors.customer,
    borderWidth: 2,
    shadowColor: colors.customer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.customer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  selectedText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  logoWrap: {
    borderRadius: 12,
    marginRight: 12,
  },
  headerText: { flex: 1, paddingRight: 36 },
  bankName: { fontSize: 17, fontWeight: '700', color: colors.foreground },
  product: { fontSize: 13, color: colors.customer, marginTop: 2 },
  compareIcon: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.muted,
  },
  compareIconActive: { backgroundColor: colors.customer, borderColor: colors.customer },
  rateBox: {
    backgroundColor: colors.muted,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateLabel: { fontSize: 12, color: colors.mutedForeground },
  rateValue: { fontSize: 22, fontWeight: '800', color: colors.primary },
  probBox: { borderRadius: 12, padding: 12, marginBottom: 10 },
  probHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  probLabel: { fontSize: 12, color: colors.mutedForeground, fontWeight: '600' },
  probValue: { fontSize: 14, fontWeight: '800' },
  probTrack: { height: 8, backgroundColor: colors.background, borderRadius: 4, overflow: 'hidden' },
  probFill: { height: '100%', borderRadius: 4 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.muted,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    maxWidth: '48%',
    flexGrow: 1,
  },
  metaText: { fontSize: 11, color: colors.foreground, flex: 1 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  featureText: { fontSize: 12, color: colors.mutedForeground, flex: 1 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  applyBtn: { flex: 1 },
  compareBtn: { flex: 1 },
  externalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 8,
  },
  externalLinkText: { fontSize: 13, fontWeight: '600', color: colors.primary },
});
