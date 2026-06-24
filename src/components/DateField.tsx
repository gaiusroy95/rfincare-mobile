import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, radii } from '@/src/theme';

type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maximumDate?: Date;
  minimumDate?: Date;
};

function parseDate(value: string): Date {
  if (!value) return new Date(1990, 0, 1);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date(1990, 0, 1) : d;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function DateField({ label, value, onChange, error, maximumDate, minimumDate }: Props) {
  const [show, setShow] = useState(false);
  const date = parseDate(value);

  const onPickerChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShow(false);
    if (selected) onChange(formatDate(selected));
  };

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity
        style={[styles.input, error && styles.inputError]}
        onPress={() => setShow(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value || 'YYYY-MM-DD'}
        </Text>
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onPickerChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      )}
      {Platform.OS === 'ios' && show && (
        <TouchableOpacity style={styles.done} onPress={() => setShow(false)}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '500', color: colors.foreground, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.card,
  },
  inputError: { borderColor: colors.destructive },
  value: { fontSize: 16, color: colors.foreground },
  placeholder: { color: colors.mutedForeground },
  error: { color: colors.destructive, fontSize: 12, marginTop: 4 },
  done: { alignSelf: 'flex-end', padding: 8 },
  doneText: { color: colors.primary, fontWeight: '600' },
});
