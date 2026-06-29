// @ts-expect-error JS module
import { calculateTotalMonthlyEmi } from './calculateTotalMonthlyEmi';

export type EligibilityResult = {
  overallProbability?: number;
  eligibleAmount?: number;
  maxMonthlyEmi?: number;
  status?: string;
  message?: string;
  banks?: Array<{
    bankName?: string;
    bestProbability?: number;
    eligibleAmount?: number;
  }>;
};

export function buildEligibilityInputFromAssessment(form: Record<string, unknown>) {
  const monthlyFromField = parseFloat(String(form.monthlyIncome || ''));
  const monthlyFromAnnual = parseFloat(String(form.annualIncome || '')) / 12;
  const monthlyFromRetirement = parseFloat(String(form.retirementIncome || '')) / 12;
  let monthlyIncome = monthlyFromField;
  if (!monthlyIncome || monthlyIncome <= 0) {
    monthlyIncome =
      form.employmentType === 'retired' ? monthlyFromRetirement : monthlyFromAnnual;
  }

  return {
    loanType: form.loanPurpose || null,
    loanAmount: parseFloat(String(form.loanAmount || '')) || 0,
    monthlyIncome: monthlyIncome || 0,
    employmentType: form.employmentType || 'salaried',
    creditScoreRange: form.creditScoreRange || null,
    existingLoans: calculateTotalMonthlyEmi(form),
  };
}
