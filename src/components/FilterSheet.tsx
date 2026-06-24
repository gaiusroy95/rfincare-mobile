import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import Button from '@/src/components/Button';
import Input from '@/src/components/Input';
import { colors, radii } from '@/src/theme';

export type FilterField = {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
  placeholder?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  fields: FilterField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onApply: () => void;
  onReset: () => void;
};

export default function FilterSheet({
  visible,
  onClose,
  fields,
  values,
  onChange,
  onApply,
  onReset,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.body}>
            {fields.map((field) => (
              <Input
                key={field.key}
                label={field.label}
                value={values[field.key] || ''}
                onChangeText={(v) => onChange(field.key, v)}
                keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                placeholder={field.placeholder}
              />
            ))}
          </ScrollView>
          <View style={styles.footer}>
            <Button title="Reset" variant="outline" onPress={onReset} style={styles.btn} />
            <Button title="Apply" variant="customer" onPress={() => { onApply(); onClose(); }} style={styles.btn} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  close: { fontSize: 20, color: colors.mutedForeground, padding: 4 },
  body: { padding: 16 },
  footer: { flexDirection: 'row', gap: 8, padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  btn: { flex: 1 },
});
