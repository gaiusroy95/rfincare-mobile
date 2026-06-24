import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/src/theme';

type Status = 'pending' | 'approved' | 'rejected' | 'in_review' | 'draft' | 'submitted' | string;

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FEF3C7', text: '#92400E' },
  in_review: { bg: '#DBEAFE', text: '#1E40AF' },
  approved: { bg: '#D1FAE5', text: '#065F46' },
  rejected: { bg: '#FEE2E2', text: '#991B1B' },
  draft: { bg: colors.muted, text: colors.mutedForeground },
  submitted: { bg: '#E0E7FF', text: '#3730A3' },
};

type Props = {
  status: Status;
  label?: string;
};

export default function StatusBadge({ status, label }: Props) {
  const key = String(status || 'pending').toLowerCase().replace(/\s+/g, '_');
  const colorset = STATUS_COLORS[key] || STATUS_COLORS.pending;
  const display = label || String(status).replace(/_/g, ' ');

  return (
    <View style={[styles.badge, { backgroundColor: colorset.bg }]}>
      <Text style={[styles.text, { color: colorset.text }]}>{display}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
});
