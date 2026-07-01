import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/src/theme';

type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  disabled?: boolean;
};

export default function Checkbox({ label, checked, onChange, description, disabled }: Props) {
  return (
    <TouchableOpacity
      style={[styles.row, disabled && styles.disabled]}
      onPress={() => !disabled && onChange(!checked)}
      activeOpacity={0.7}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Text style={styles.check}>✓</Text> : null}
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
  disabled: { opacity: 0.5 },
  box: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  boxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  check: { color: '#fff', fontSize: 14, fontWeight: '700' },
  textWrap: { flex: 1 },
  label: { fontSize: 14, color: colors.foreground, lineHeight: 20 },
  description: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
});
