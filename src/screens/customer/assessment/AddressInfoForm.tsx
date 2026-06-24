import React, { useEffect, useState } from 'react';
import Input from '@/src/components/Input';
import Select from '@/src/components/Select';
import { apiClient } from '@/src/api/apiClient';
import type { AssessmentFormData } from './types';

type Props = {
  form: AssessmentFormData;
  errors: Record<string, string>;
  onChange: (key: keyof AssessmentFormData, value: unknown) => void;
};

const residenceOptions = [
  { value: 'owned', label: 'Owned' },
  { value: 'rented', label: 'Rented' },
  { value: 'company_provided', label: 'Company provided' },
  { value: 'family', label: 'Living with family' },
];

export default function AddressInfoForm({ form, errors, onChange }: Props) {
  const [states, setStates] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    apiClient.get('/states').then((r) => {
      const list = Array.isArray(r.data) ? r.data : r.data?.data || [];
      setStates(list.map((s: { name?: string; code?: string }) => ({
        value: s.name || s.code || '',
        label: s.name || s.code || '',
      })));
    }).catch(() => {});
  }, []);

  return (
    <>
      <Input label="Address Line 1" value={form.addressLine1} onChangeText={(v) => onChange('addressLine1', v)} error={errors.addressLine1} />
      <Input label="Address Line 2" value={form.addressLine2} onChangeText={(v) => onChange('addressLine2', v)} />
      <Input label="City" value={form.city} onChangeText={(v) => onChange('city', v)} error={errors.city} />
      <Input label="District" value={form.district} onChangeText={(v) => onChange('district', v)} />
      <Select label="State" value={form.state} options={states.length ? states : [{ value: form.state, label: form.state || 'Select state' }]} onChange={(v) => onChange('state', v)} error={errors.state} />
      <Input label="PIN Code" value={form.pinCode} onChangeText={(v) => onChange('pinCode', v.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" maxLength={6} error={errors.pinCode} />
      <Select label="Residence Type" value={form.residenceType} options={residenceOptions} onChange={(v) => onChange('residenceType', v)} />
      <Input label="Years at Address" value={form.yearsAtAddress} onChangeText={(v) => onChange('yearsAtAddress', v)} keyboardType="numeric" />
      {form.residenceType === 'rented' && (
        <Input label="Monthly Rent (₹)" value={form.monthlyRent} onChangeText={(v) => onChange('monthlyRent', v)} keyboardType="numeric" error={errors.monthlyRent} />
      )}
    </>
  );
}
