import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Select from '@/src/components/Select';
// @ts-expect-error JS module
import { bankService } from '@/src/services/apiServices';
// @ts-expect-error JS module
import { LOAN_PRIORITY_OPTIONS, getLoanPriorities, serializeLoanPriorities } from '@/src/utils/loanPriorities';
import { colors } from '@/src/theme';
import type { AssessmentFormData } from './types';

const MAX = 2;

type Props = {
  form: AssessmentFormData;
  errors: Record<string, string>;
  onChange: (key: keyof AssessmentFormData, value: unknown) => void;
};

export default function BankPreferencesStep({ form, errors, onChange }: Props) {
  const [banks, setBanks] = useState<{ id: string; name: string }[]>([]);
  const selected = getLoanPriorities(form);

  useEffect(() => {
    bankService.getActiveBanks({ includeProducts: false })
      .then((data: unknown) => setBanks(Array.isArray(data) ? data as { id: string; name: string }[] : []))
      .catch(() => setBanks([]));
  }, []);

  const bankOptions = [
    { value: '', label: 'Select preferred bank (optional)' },
    ...banks.map((b) => ({ value: b.id, label: b.name })),
  ];

  const toggle = (id: string) => {
    let next: string[];
    if (selected.includes(id)) next = selected.filter((x) => x !== id);
    else if (selected.length >= MAX) return;
    else next = [...selected, id];
    onChange('loanPriorities', next);
    onChange('loanPriority', serializeLoanPriorities(next));
  };

  return (
    <>
      <Text style={styles.title}>Bank & loan preferences</Text>
      <Select
        label="Preferred bank"
        value={form.preferredBankId}
        options={bankOptions}
        onChange={(v) => {
          const bank = banks.find((b) => b.id === v);
          onChange('preferredBankId', v);
          onChange('preferredBankName', bank?.name || '');
        }}
      />
      {form.preferredBankName ? (
        <Text style={styles.bankNote}>Applying with: {form.preferredBankName}</Text>
      ) : null}
      <Text style={styles.sub}>Your top priorities (select 1–2)</Text>
      <Text style={styles.count}>{selected.length} / {MAX} selected</Text>
      {LOAN_PRIORITY_OPTIONS.map((opt: { id: string; label: string; description: string }) => {
        const isSelected = selected.includes(opt.id);
        const disabled = !isSelected && selected.length >= MAX;
        return (
          <TouchableOpacity
            key={opt.id}
            style={[styles.card, isSelected && styles.cardSelected, disabled && styles.cardDisabled]}
            onPress={() => !disabled && toggle(opt.id)}
            disabled={disabled}
          >
            <Text style={styles.cardLabel}>{isSelected ? '☑' : '☐'} {opt.label}</Text>
            <Text style={styles.cardDesc}>{opt.description}</Text>
          </TouchableOpacity>
        );
      })}
      {errors.loanPriority ? <Text style={styles.error}>{errors.loanPriority}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  sub: { fontWeight: '600', marginTop: 12, marginBottom: 4 },
  count: { fontSize: 12, color: colors.mutedForeground, marginBottom: 8 },
  bankNote: { padding: 10, backgroundColor: colors.muted, borderRadius: 8, marginBottom: 8 },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, marginBottom: 8 },
  cardSelected: { borderColor: colors.primary, backgroundColor: colors.muted },
  cardDisabled: { opacity: 0.5 },
  cardLabel: { fontWeight: '600', color: colors.foreground },
  cardDesc: { fontSize: 12, color: colors.mutedForeground, marginTop: 4 },
  error: { color: colors.destructive, fontSize: 12 },
});
