import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/src/components/Card';
import Checkbox from '@/src/components/Checkbox';
import { colors } from '@/src/theme';
import SelectedProductSummary from '@/src/components/assessment/SelectedProductSummary';
import type { AssessmentFormData } from './types';

type Props = {
  form: AssessmentFormData;
  errors: Record<string, string>;
  onChange: (key: keyof AssessmentFormData, value: unknown) => void;
};

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function prettify(value?: string | null) {
  if (value == null || value === '') return '—';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatInr(value?: string | number | null) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '—';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value && value !== '' ? value : '—'}</Text>
    </View>
  );
}

function Segment({
  icon,
  title,
  accent,
  children,
}: {
  icon: IconName;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <View style={styles.segmentHeader}>
        <View style={[styles.iconWrap, { backgroundColor: `${accent}1A` }]}>
          <Ionicons name={icon} size={18} color={accent} />
        </View>
        <Text style={styles.segmentTitle}>{title}</Text>
      </View>
      <View style={styles.segmentBody}>{children}</View>
    </Card>
  );
}

export default function ReviewSubmitForm({ form, errors, onChange }: Props) {
  const fullName = [form.title, form.firstName, form.middleName, form.lastName]
    .map((v) => (v || '').trim())
    .filter(Boolean)
    .join(' ');

  const addressLine = [form.addressLine1, form.addressLine2, form.city, form.district, form.state, form.pinCode]
    .map((v) => (v || '').trim())
    .filter(Boolean)
    .join(', ');

  const incomeValue = form.employmentType === 'retired' ? form.retirementIncome : form.annualIncome;

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Review your application</Text>
        <Text style={styles.subtitle}>Please confirm the details below before submitting.</Text>
      </View>

      <Segment icon="person-outline" title="Personal details" accent={colors.customer}>
        <Row label="Name" value={fullName} />
        <Row label="Date of birth" value={form.dateOfBirth} />
        <Row label="Gender" value={prettify(form.gender)} />
        <Row label="Marital status" value={prettify(form.maritalStatus)} />
        <Row label="Email" value={form.email} />
        <Row label="Phone" value={form.phone} />
        {form.pan ? <Row label="PAN" value={form.pan} /> : null}
        {form.aadhaar ? <Row label="Aadhaar" value={`XXXX-XXXX-${String(form.aadhaar).slice(-4)}`} /> : null}
      </Segment>

      <Segment icon="location-outline" title="Address" accent={colors.accent}>
        <Row label="Address" value={addressLine} />
        {form.residenceType ? <Row label="Residence" value={prettify(form.residenceType)} /> : null}
      </Segment>

      <Segment icon="briefcase-outline" title="Employment & income" accent={colors.employee}>
        <Row label="Employment" value={prettify(form.employmentType)} />
        {form.employerName ? <Row label="Employer" value={form.employerName} /> : null}
        {form.jobTitle ? <Row label="Job title" value={form.jobTitle} /> : null}
        <Row
          label={form.employmentType === 'retired' ? 'Retirement income' : 'Annual income'}
          value={formatInr(incomeValue)}
        />
        {form.monthlyIncome ? <Row label="Monthly income" value={formatInr(form.monthlyIncome)} /> : null}
      </Segment>

      <SelectedProductSummary loanPurpose={form.loanPurpose} />

      <Segment icon="cash-outline" title="Loan details" accent={colors.success}>
        <Row label="Requested amount" value={formatInr(form.loanAmount)} />
        <Row label="Credit score range" value={prettify(form.creditScoreRange)} />
        {form.monthlyDebtPayments ? <Row label="Existing EMI" value={formatInr(form.monthlyDebtPayments)} /> : null}
        {form.preferredBankName ? <Row label="Preferred bank" value={form.preferredBankName} /> : null}
      </Segment>

      <Segment icon="shield-checkmark-outline" title="Declarations & consents" accent={colors.primary}>
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
      </Segment>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { marginBottom: 12 },
  title: { fontWeight: '700', fontSize: 18, color: colors.foreground },
  subtitle: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
  segmentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  segmentTitle: { fontSize: 15, fontWeight: '700', color: colors.foreground },
  segmentBody: { gap: 2 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: { fontSize: 13, color: colors.mutedForeground, flex: 1, paddingRight: 12 },
  rowValue: { fontSize: 13, color: colors.foreground, fontWeight: '600', flex: 1.4, textAlign: 'right' },
  error: { color: colors.destructive, fontSize: 12, marginBottom: 8, marginTop: 2 },
});
