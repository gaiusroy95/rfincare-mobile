// @ts-expect-error JS module
import { requiresCoApplicant } from '@/src/constants/assessmentDocuments';
// @ts-expect-error JS module
import { FINANCIAL_HISTORY_QUESTIONS } from '@/src/constants/assessmentFinancialHistory';
// @ts-expect-error JS module
import { serializeExistingLoansForPayload } from '@/src/utils/existingLoans';
import type { AssessmentFormData } from './types';

export function buildApplicationPayload(
  form: AssessmentFormData,
  customerId: string | null,
  status = 'draft',
) {
  const financialHistory: Record<string, string> = {};
  FINANCIAL_HISTORY_QUESTIONS.forEach((q: { field: string; payloadKey: string }) => {
    financialHistory[q.payloadKey] = (form as Record<string, string>)[q.field] || '';
  });

  return {
    customerId,
    status,
    title: form.title || null,
    firstName: form.firstName,
    middleName: form.middleName || null,
    lastName: form.lastName,
    dateOfBirth: form.dateOfBirth,
    gender: form.gender || null,
    maritalStatus: form.maritalStatus || null,
    email: form.email,
    phone: form.phone,
    aadhaarNumber: form.aadhaar || null,
    panNumber: form.pan || null,
    addressLine1: form.addressLine1,
    addressLine2: form.addressLine2 || null,
    city: form.city,
    district: form.district || null,
    state: form.state,
    pinCode: form.pinCode,
    residenceType: form.residenceType || null,
    yearsAtAddress: form.yearsAtAddress ? parseInt(form.yearsAtAddress, 10) : null,
    monthlyRent: form.monthlyRent ? parseFloat(form.monthlyRent) : null,
    employmentType: form.employmentType,
    employerName: form.employerName || null,
    jobTitle: form.jobTitle || null,
    industry: form.industry || null,
    yearsEmployed: form.yearsEmployed ? parseInt(form.yearsEmployed, 10) : null,
    annualIncome: form.annualIncome ? parseFloat(form.annualIncome) : 0,
    monthlyIncome: form.monthlyIncome ? parseFloat(form.monthlyIncome) : 0,
    employerPhone: form.employerPhone || null,
    retirementIncome: form.retirementIncome ? parseFloat(form.retirementIncome) : null,
    coApplicant: requiresCoApplicant(form.employmentType)
      ? {
          firstName: form.coApplicant.firstName,
          lastName: form.coApplicant.lastName,
          relationship: form.coApplicant.relationship,
          phone: form.coApplicant.phone,
          email: form.coApplicant.email || null,
          panNumber: form.coApplicant.pan,
          aadhaarNumber: form.coApplicant.aadhaar,
          employmentType: form.coApplicant.employmentType,
          employerName: form.coApplicant.employerName || null,
          jobTitle: form.coApplicant.jobTitle || null,
          industry: form.coApplicant.industry || null,
          yearsEmployed: form.coApplicant.yearsEmployed ? parseInt(form.coApplicant.yearsEmployed, 10) : null,
          annualIncome: form.coApplicant.annualIncome ? parseFloat(form.coApplicant.annualIncome) : null,
          monthlyIncome: form.coApplicant.monthlyIncome ? parseFloat(form.coApplicant.monthlyIncome) : null,
          employerPhone: form.coApplicant.employerPhone || null,
        }
      : null,
    loanPurpose: form.loanPurpose,
    loanAmount: form.loanAmount ? parseFloat(form.loanAmount) : null,
    creditScoreRange: form.creditScoreRange,
    hasRunningLoanOrCard: form.hasRunningLoanOrCard,
    existingLoans: serializeExistingLoansForPayload(form.existingLoans),
    monthlyDebtPayments: form.monthlyDebtPayments ? parseFloat(form.monthlyDebtPayments) : null,
    hasAnyOverdue: form.hasAnyOverdue,
    overdueAmount: form.overdueAmount ? parseFloat(form.overdueAmount) : null,
    overdueLoanType: form.overdueLoanType || null,
    ...financialHistory,
    preferredBankId: form.preferredBankId || null,
    preferredBankName: form.preferredBankName || null,
    loanPriority: form.loanPriority || null,
    loanPriorities: form.loanPriorities,
  };
}
