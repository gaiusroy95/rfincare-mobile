import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/src/components/Card';
import { colors } from '@/src/theme';
import { getLoanProductLabel } from '@/src/utils/loanProductLabel';

type Props = {
  loanPurpose?: string | null;
  compact?: boolean;
};

export default function SelectedProductSummary({ loanPurpose, compact }: Props) {
  const label = getLoanProductLabel(loanPurpose);
  if (!label) return null;

  return (
    <Card style={compact ? styles.compactCard : undefined}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name="document-text-outline" size={18} color={colors.customer} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.caption}>Applying for</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  compactCard: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${colors.customer}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  caption: { fontSize: 12, color: colors.mutedForeground, marginBottom: 2 },
  label: { fontSize: 16, fontWeight: '700', color: colors.foreground },
});
