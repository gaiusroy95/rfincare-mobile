import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Input from '@/src/components/Input';
import Select from '@/src/components/Select';
import Button from '@/src/components/Button';
// @ts-expect-error JS module
import { EXISTING_LOAN_TYPE_OPTIONS } from '@/src/constants/existingLoanTypes';
// @ts-expect-error JS module
import { createEmptyLoanRow } from '@/src/utils/existingLoans';
import { colors } from '@/src/theme';

type LoanRow = { id: string; loanType: string; emiAmount: string };

type Props = {
  existingLoans: LoanRow[];
  errors: Record<string, string>;
  onChange: (loans: LoanRow[]) => void;
};

export default function ExistingLoansForm({ existingLoans, errors, onChange }: Props) {
  const rows = existingLoans?.length ? existingLoans : [createEmptyLoanRow()];

  const updateRow = (rowId: string, patch: Partial<LoanRow>) => {
    onChange(rows.map((r) => (r.id === rowId ? { ...r, ...patch } : r)));
  };

  const removeRow = (rowId: string) => {
    if (rows.length <= 1) {
      onChange([createEmptyLoanRow()]);
      return;
    }
    onChange(rows.filter((r) => r.id !== rowId));
  };

  const addRow = () => onChange([...rows, createEmptyLoanRow()]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.hint}>Add each running loan or credit card with monthly EMI.</Text>
      {rows.map((row, index) => (
        <View key={row.id} style={styles.row}>
          <Select
            label={`Loan type ${rows.length > 1 ? index + 1 : ''}`}
            value={row.loanType}
            options={EXISTING_LOAN_TYPE_OPTIONS}
            onChange={(v) => updateRow(row.id, { loanType: v })}
            error={errors[`existingLoan_${row.id}_type`]}
          />
          <Input
            label="EMI amount (₹)"
            value={row.emiAmount}
            onChangeText={(v) => updateRow(row.id, { emiAmount: v })}
            numeric
            error={errors[`existingLoan_${row.id}_emi`]}
          />
          <Button title="Remove" variant="outline" onPress={() => removeRow(row.id)} />
        </View>
      ))}
      {errors.existingLoans ? <Text style={styles.error}>{errors.existingLoans}</Text> : null}
      <Button title="Add loan / EMI" variant="outline" onPress={addRow} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 8 },
  hint: { fontSize: 12, color: colors.mutedForeground, marginBottom: 8 },
  row: { padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 8, marginBottom: 12, backgroundColor: colors.muted },
  error: { color: colors.destructive, fontSize: 12, marginBottom: 8 },
});
