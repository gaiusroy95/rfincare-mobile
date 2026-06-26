import React from 'react';
import Input from '@/src/components/Input';
import Select from '@/src/components/Select';
// @ts-expect-error JS module
import { requiresCoApplicant } from '@/src/constants/assessmentDocuments';
import type { AssessmentFormData, CoApplicant } from './types';
import CoApplicantForm from './CoApplicantForm';

type Props = {
  form: AssessmentFormData;
  errors: Record<string, string>;
  onChange: (key: keyof AssessmentFormData, value: unknown) => void;
};

const employmentOptions = [
  { value: 'salaried', label: 'Salaried' },
  { value: 'self_employed', label: 'Self-employed' },
  { value: 'business', label: 'Business owner' },
  { value: 'retired', label: 'Retired' },
  { value: 'student', label: 'Student' },
  { value: 'homemaker', label: 'Homemaker' },
];

export default function EmploymentInfoForm({ form, errors, onChange }: Props) {
  const isRetired = form.employmentType === 'retired';

  const updateCoApplicant = (key: keyof CoApplicant, value: string) => {
    onChange('coApplicant', { ...form.coApplicant, [key]: value });
  };

  return (
    <>
      <Select label="Employment Type" value={form.employmentType} options={employmentOptions} onChange={(v) => onChange('employmentType', v)} error={errors.employmentType} />
      {!isRetired ? (
        <>
          <Input label="Employer Name" value={form.employerName} onChangeText={(v) => onChange('employerName', v)} error={errors.employerName} />
          <Input label="Job Title" value={form.jobTitle} onChangeText={(v) => onChange('jobTitle', v)} />
          <Input label="Industry" value={form.industry} onChangeText={(v) => onChange('industry', v)} />
          <Input label="Years Employed" value={form.yearsEmployed} onChangeText={(v) => onChange('yearsEmployed', v)} numeric decimal />
          <Input label="Annual Income (₹)" value={form.annualIncome} onChangeText={(v) => onChange('annualIncome', v)} numeric />
          <Input label="Monthly Income (₹)" value={form.monthlyIncome} onChangeText={(v) => onChange('monthlyIncome', v)} numeric error={errors.monthlyIncome} />
          <Input label="Employer Phone" value={form.employerPhone} onChangeText={(v) => onChange('employerPhone', v.replace(/\D/g, '').slice(0, 10))} keyboardType="phone-pad" maxLength={10} />
        </>
      ) : (
        <>
          <Input label="Retirement Income (₹)" value={form.retirementIncome} onChangeText={(v) => onChange('retirementIncome', v)} numeric error={errors.retirementIncome} />
          {requiresCoApplicant(form.employmentType) && (
            <CoApplicantForm coApplicant={form.coApplicant} errors={errors} onChange={updateCoApplicant} />
          )}
        </>
      )}
    </>
  );
}
