import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/src/theme';

export type RadioOption = { value: string; label: string; description?: string };

type Props = {
  label?: string;
  value: string;
  options: RadioOption[];
  onChange: (value: string) => void;
  error?: string;
};

export default function RadioGroup({ label, value, options, onChange, error }: Props) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.row, selected && styles.rowSelected]}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.7}
          >
            <View style={[styles.circle, selected && styles.circleSelected]}>
              {selected ? <View style={styles.dot} /> : null}
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.optionLabel}>{opt.label}</Text>
              {opt.description ? <Text style={styles.description}>{opt.description}</Text> : null}
            </View>
          </TouchableOpacity>
        );
      })}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '500', color: colors.foreground, marginBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  rowSelected: { borderColor: colors.primary, backgroundColor: colors.muted },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  circleSelected: { borderColor: colors.primary },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  textWrap: { flex: 1 },
  optionLabel: { fontSize: 14, color: colors.foreground },
  description: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  error: { color: colors.destructive, fontSize: 12 },
});
