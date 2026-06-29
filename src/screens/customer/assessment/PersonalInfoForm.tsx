import React from 'react';
import { Text } from 'react-native';
import Input from '@/src/components/Input';
import Select from '@/src/components/Select';
import DateField from '@/src/components/DateField';
import type { AssessmentFormData } from './types';

type Props = {
  form: AssessmentFormData;
  errors: Record<string, string>;
  onChange: (key: keyof AssessmentFormData, value: unknown) => void;
};

const titleOptions = [
  { value: 'mr', label: 'Mr.' },
  { value: 'mrs', label: 'Mrs.' },
  { value: 'ms', label: 'Ms.' },
  { value: 'dr', label: 'Dr.' },
];

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const maritalOptions = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

export default function PersonalInfoForm({ form, errors, onChange }: Props) {
  const maxDob = new Date();
  maxDob.setFullYear(maxDob.getFullYear() - 18);

  return (
    <>
      <Select label="Title" value={form.title} options={titleOptions} onChange={(v) => onChange('title', v)} error={errors.title} />
      <Input label="First Name" value={form.firstName} onChangeText={(v) => onChange('firstName', v)} error={errors.firstName} />
      <Input label="Middle Name" value={form.middleName} onChangeText={(v) => onChange('middleName', v)} />
      <Input label="Last Name" value={form.lastName} onChangeText={(v) => onChange('lastName', v)} error={errors.lastName} />
      <DateField label="Date of Birth" value={form.dateOfBirth} onChange={(v) => onChange('dateOfBirth', v)} error={errors.dateOfBirth} maximumDate={maxDob} />
      <Select label="Gender" value={form.gender} options={genderOptions} onChange={(v) => onChange('gender', v)} error={errors.gender} />
      <Select label="Marital Status" value={form.maritalStatus} options={maritalOptions} onChange={(v) => onChange('maritalStatus', v)} />
      <Input label="Email" value={form.email} onChangeText={(v) => onChange('email', v)} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
      <Input label="Phone (10 digits)" value={form.phone} onChangeText={(v) => onChange('phone', v.replace(/\D/g, '').slice(0, 10))} keyboardType="phone-pad" maxLength={10} error={errors.phone} />
      <Input label="Aadhaar (last 4 digits)" value={form.aadhaar} onChangeText={(v) => onChange('aadhaar', v.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" maxLength={4} error={errors.aadhaar} />
      <Input label="PAN" value={form.pan} onChangeText={(v) => onChange('pan', v.toUpperCase().slice(0, 10))} autoCapitalize="characters" maxLength={10} error={errors.pan} />
      <Text style={{ fontSize: 12, color: '#4A5568', marginBottom: 8 }}>You must be at least 18 years old to apply.</Text>
    </>
  );
}
