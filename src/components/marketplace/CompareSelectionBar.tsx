import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BankLogo from '@/src/components/BankLogo';
import Button from '@/src/components/Button';
import { colors } from '@/src/theme';

type SelectedItem = {
  id: string;
  title: string;
  logo?: string | null;
};

type Props = {
  items: SelectedItem[];
  max: number;
  onCompareNow: () => void;
  onClear: () => void;
};

export default function CompareSelectionBar({ items, max, onCompareNow, onClear }: Props) {
  if (!items.length) return null;

  const canCompare = items.length >= 2;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.title}>Compare {items.length} of {max}</Text>
          <View style={styles.avatars}>
            {items.slice(0, 5).map((item) => (
              <View key={item.id} style={styles.avatar}>
                <BankLogo uri={item.logo} size={28} iconSize={14} backgroundColor="transparent" />
              </View>
            ))}
            {items.length > 5 ? (
              <View style={styles.more}>
                <Text style={styles.moreText}>+{items.length - 5}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onClear} hitSlop={8}>
            <Text style={styles.clear}>Clear</Text>
          </TouchableOpacity>
          <Button
            title="Compare Now"
            variant="customer"
            onPress={onCompareNow}
            disabled={!canCompare}
            style={styles.compareBtn}
          />
        </View>
      </View>
      {!canCompare ? (
        <Text style={styles.hint}>Select at least 2 banks to compare</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 8 },
  avatars: { flexDirection: 'row', gap: 6 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  more: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.customer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  actions: { alignItems: 'flex-end', gap: 6 },
  clear: { fontSize: 12, color: colors.mutedForeground, fontWeight: '600' },
  compareBtn: { minWidth: 130, paddingHorizontal: 12 },
  hint: { fontSize: 11, color: colors.mutedForeground, marginTop: 8 },
});
