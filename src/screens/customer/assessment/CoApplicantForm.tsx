import React from 'react';
import { Text } from 'react-native';
import Input from '@/src/components/Input';
import Select from '@/src/components/Select';
import type { CoApplicant } from './types';

type Props = {
  coApplicant: CoApplicant;
  errors: Record<string, string>;
  onChange: (key: keyof CoApplicant, value: string) => void;
};

const relationshipOptions = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'other', label: 'Other' },
];

export default function CoApplicantForm({ coApplicant, errors, onChange }: Props) {
  return (
    <>
      <Text style={{ fontWeight: '700', marginVertical: 12 }}>Co-applicant details</Text>
      <Input label="First Name" value={coApplicant.firstName} onChangeText={(v) => onChange('firstName', v)} />
      <Input label="Last Name" value={coApplicant.lastName} onChangeText={(v) => onChange('lastName', v)} />
      <Select label="Relationship" value={coApplicant.relationship} options={relationshipOptions} onChange={(v) => onChange('relationship', v)} />
      <Input label="Phone" value={coApplicant.phone} onChangeText={(v) => onChange('phone', v.replace(/\D/g, '').slice(0, 10))} keyboardType="phone-pad" maxLength={10} />
      <Input label="Email" value={coApplicant.email} onChangeText={(v) => onChange('email', v)} keyboardType="email-address" autoCapitalize="none" />
      <Input label="PAN" value={coApplicant.pan} onChangeText={(v) => onChange('pan', v.toUpperCase().slice(0, 10))} autoCapitalize="characters" maxLength={10} />
      <Input label="Aadhaar (last 4 digits)" value={coApplicant.aadhaar} onChangeText={(v) => onChange('aadhaar', v.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" maxLength={4} />
      <Select label="Employment Type" value={coApplicant.employmentType} options={[
        { value: 'salaried', label: 'Salaried' },
        { value: 'self_employed', label: 'Self-employed' },
        { value: 'retired', label: 'Retired' },
      ]} onChange={(v) => onChange('employmentType', v)} />
      <Input label="Employer Name" value={coApplicant.employerName} onChangeText={(v) => onChange('employerName', v)} />
      <Input label="Monthly Income (₹)" value={coApplicant.monthlyIncome} onChangeText={(v) => onChange('monthlyIncome', v)} numeric />
    </>
  );
}
