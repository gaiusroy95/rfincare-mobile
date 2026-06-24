import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Input from '@/src/components/Input';
import Select from '@/src/components/Select';
import RadioGroup from '@/src/components/RadioGroup';
import { useLoanProducts } from '@/src/contexts/LoanProductsContext';
// @ts-expect-error JS module
import { CREDIT_SCORE_RANGE_OPTIONS_FULL } from '@/src/constants/creditScoreRanges';
// @ts-expect-error JS module
import { FINANCIAL_HISTORY_QUESTIONS, FINANCIAL_YES_NO_OPTIONS } from '@/src/constants/assessmentFinancialHistory';
// @ts-expect-error JS module
import { calculateTotalMonthlyEmi } from '@/src/utils/calculateTotalMonthlyEmi';
import { colors } from '@/src/theme';
import type { AssessmentFormData } from './types';
import ExistingLoansForm from './ExistingLoansForm';

type Props = {
  form: AssessmentFormData;
  errors: Record<string, string>;
  onChange: (key: keyof AssessmentFormData, value: unknown) => void;
};

const overdueOptions = [
  { value: 'personal_loan', label: 'Personal loan' },
  { value: 'home_loan', label: 'Home loan' },
  { value: 'car_loan', label: 'Car loan' },
  { value: 'two_wheeler_loan', label: 'Two wheeler loan' },
  { value: 'credit_card', label: 'Credit card' },
  { value: 'other', label: 'Other' },
];

export default function FinancialInfoForm({ form, errors, onChange }: Props) {
  const { products } = useLoanProducts();
  const productList = Array.isArray(products) ? products.filter((p: { apiKey?: string }) => p?.apiKey) : [];
  const loanPurposeOptions = [
    ...productList.map((p: { apiKey: string; label?: string }) => ({ value: p.apiKey, label: p.label || p.apiKey })),
    { value: 'debt_consolidation', label: 'Debt Consolidation' },
  ];
  const totalEmi = calculateTotalMonthlyEmi(form);
  const hasRunning = form.hasRunningLoanOrCard === 'yes';
  const hasOverdue = form.hasAnyOverdue === 'yes';

  return (
    <>
      <Select label="Loan Purpose" value={form.loanPurpose} options={loanPurposeOptions} onChange={(v) => onChange('loanPurpose', v)} error={errors.loanPurpose} />
      <Input label="Requested Loan Amount (₹)" value={form.loanAmount} onChangeText={(v) => onChange('loanAmount', v)} keyboardType="numeric" error={errors.loanAmount} />
      <Select label="Estimated Credit Score Range" value={form.creditScoreRange} options={CREDIT_SCORE_RANGE_OPTIONS_FULL} onChange={(v) => onChange('creditScoreRange', v)} error={errors.creditScoreRange} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Existing loan details</Text>
        <Select
          label="Do you have any loan or credit card running?"
          value={form.hasRunningLoanOrCard}
          options={FINANCIAL_YES_NO_OPTIONS}
          onChange={(v) => onChange('hasRunningLoanOrCard', v)}
          error={errors.hasRunningLoanOrCard}
        />
        {hasRunning && (
          <ExistingLoansForm
            existingLoans={form.existingLoans}
            errors={errors}
            onChange={(loans) => {
              onChange('existingLoans', loans);
              onChange('monthlyDebtPayments', String(calculateTotalMonthlyEmi({ ...form, existingLoans: loans })));
            }}
          />
        )}
      </View>

      <View style={styles.emiBox}>
        <Text style={styles.emiLabel}>Total monthly EMI obligations</Text>
        <Text style={styles.emiValue}>₹{totalEmi.toLocaleString('en-IN')}</Text>
      </View>

      <Select label="Any overdue payments?" value={form.hasAnyOverdue} options={FINANCIAL_YES_NO_OPTIONS} onChange={(v) => onChange('hasAnyOverdue', v)} />
      {hasOverdue && (
        <>
          <Input label="Overdue amount (₹)" value={form.overdueAmount} onChangeText={(v) => onChange('overdueAmount', v)} keyboardType="numeric" />
          <Select label="Overdue loan type" value={form.overdueLoanType} options={overdueOptions} onChange={(v) => onChange('overdueLoanType', v)} />
        </>
      )}

      <Text style={styles.sectionTitle}>Financial history disclosures</Text>
      {FINANCIAL_HISTORY_QUESTIONS.map((q: { field: string; label: string; description?: string }) => (
        <RadioGroup
          key={q.field}
          label={q.label}
          value={(form as Record<string, string>)[q.field] || ''}
          options={FINANCIAL_YES_NO_OPTIONS.map((o: { value: string; label: string }) => ({ ...o, description: q.description }))}
          onChange={(v) => onChange(q.field as keyof AssessmentFormData, v)}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  section: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, marginBottom: 12 },
  sectionTitle: { fontWeight: '700', marginBottom: 8, color: colors.foreground },
  emiBox: { backgroundColor: colors.muted, padding: 12, borderRadius: 8, marginBottom: 12 },
  emiLabel: { fontSize: 12, color: colors.mutedForeground },
  emiValue: { fontSize: 20, fontWeight: '700', color: colors.primary },
});
