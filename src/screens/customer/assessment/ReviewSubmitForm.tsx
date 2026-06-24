import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Card from '@/src/components/Card';
import Checkbox from '@/src/components/Checkbox';
import { colors } from '@/src/theme';
import type { AssessmentFormData } from './types';

type Props = {
  form: AssessmentFormData;
  errors: Record<string, string>;
  onChange: (key: keyof AssessmentFormData, value: unknown) => void;
};

export default function ReviewSubmitForm({ form, errors, onChange }: Props) {
  return (
    <Card>
      <Text style={styles.title}>Review your application</Text>
      <Text>Name: {form.title} {form.firstName} {form.middleName} {form.lastName}</Text>
      <Text>Email: {form.email}</Text>
      <Text>Phone: {form.phone}</Text>
      <Text>Address: {form.addressLine1}, {form.city}, {form.state} {form.pinCode}</Text>
      <Text>Employment: {form.employmentType} — {form.employerName || form.retirementIncome}</Text>
      <Text>Loan: ₹{form.loanAmount} for {form.loanPurpose}</Text>
      <Text>Credit score range: {form.creditScoreRange}</Text>
      {form.preferredBankName ? <Text>Preferred bank: {form.preferredBankName}</Text> : null}

      <Checkbox
        label="I certify that all information provided is accurate and complete."
        checked={form.certifyAccuracy}
        onChange={(v) => onChange('certifyAccuracy', v)}
      />
      {errors.certifyAccuracy ? <Text style={styles.error}>{errors.certifyAccuracy}</Text> : null}
      <Checkbox
        label="I authorize Rfincare and partner banks to perform credit checks."
        checked={form.authorizeCredit}
        onChange={(v) => onChange('authorizeCredit', v)}
      />
      {errors.authorizeCredit ? <Text style={styles.error}>{errors.authorizeCredit}</Text> : null}
      <Checkbox
        label="I agree to the Terms of Service and Privacy Policy."
        checked={form.agreeTerms}
        onChange={(v) => onChange('agreeTerms', v)}
      />
      {errors.agreeTerms ? <Text style={styles.error}>{errors.agreeTerms}</Text> : null}
      <Checkbox
        label="I consent to receive application updates via SMS/email (optional)."
        checked={form.consentCommunications}
        onChange={(v) => onChange('consentCommunications', v)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '700', fontSize: 16, marginBottom: 12 },
  error: { color: colors.destructive, fontSize: 12, marginBottom: 8 },
});
