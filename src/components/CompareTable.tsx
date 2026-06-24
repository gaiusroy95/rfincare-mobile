import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import BankLogo from '@/src/components/BankLogo';
import { colors } from '@/src/theme';

export type CompareColumn = {
  id: string;
  title: string;
  subtitle?: string;
  imageUri?: string;
};

export type CompareRow = { label: string; values: Record<string, string> };

type Props = {
  columns: CompareColumn[];
  rows: CompareRow[];
};

export default function CompareTable({ columns, rows }: Props) {
  if (!columns.length) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View>
        <View style={styles.headerRow}>
          <View style={styles.labelCell}>
            <Text style={styles.headerText}>Feature</Text>
          </View>
          {columns.map((col) => (
            <View key={col.id} style={styles.dataCell}>
              {col.imageUri ? (
                <BankLogo uri={col.imageUri} size={48} style={styles.colLogo} backgroundColor="transparent" />
              ) : null}
              <Text style={styles.headerText} numberOfLines={2}>{col.title}</Text>
              {col.subtitle ? (
                <Text style={styles.headerSub} numberOfLines={2}>{col.subtitle}</Text>
              ) : null}
            </View>
          ))}
        </View>
        {rows.map((row, i) => (
          <View key={row.label} style={[styles.row, i % 2 === 0 && styles.rowAlt]}>
            <View style={styles.labelCell}>
              <Text style={styles.labelText}>{row.label}</Text>
            </View>
            {columns.map((col) => (
              <View key={col.id} style={styles.dataCell}>
                <Text style={styles.valueText}>{row.values[col.id] || '—'}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const CELL_W = 130;
const LABEL_W = 140;

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', backgroundColor: colors.primary },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  rowAlt: { backgroundColor: colors.muted },
  labelCell: { width: LABEL_W, padding: 10, justifyContent: 'center' },
  dataCell: { width: CELL_W, padding: 10, justifyContent: 'center', alignItems: 'center' },
  colLogo: { marginBottom: 6 },
  headerText: { color: '#fff', fontWeight: '700', fontSize: 11, textAlign: 'center' },
  headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 9, marginTop: 2, textAlign: 'center' },
  labelText: { fontSize: 12, fontWeight: '600', color: colors.foreground },
  valueText: { fontSize: 11, color: colors.mutedForeground, textAlign: 'center' },
});
