// @ts-expect-error JS module
import { FINANCIAL_HISTORY_INITIAL } from '@/src/constants/assessmentFinancialHistory';

export const INITIAL_CO_APPLICANT = {
  firstName: '',
  lastName: '',
  relationship: '',
  phone: '',
  email: '',
  pan: '',
  aadhaar: '',
  employmentType: '',
  employerName: '',
  jobTitle: '',
  industry: '',
  yearsEmployed: '',
  annualIncome: '',
  monthlyIncome: '',
  employerPhone: '',
};

export type CoApplicant = typeof INITIAL_CO_APPLICANT;

export type AssessmentFormData = {
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  email: string;
  phone: string;
  aadhaar: string;
  pan: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  residenceType: string;
  yearsAtAddress: string;
  monthlyRent: string;
  employmentType: string;
  employerName: string;
  jobTitle: string;
  industry: string;
  yearsEmployed: string;
  annualIncome: string;
  monthlyIncome: string;
  employerPhone: string;
  retirementIncome: string;
  coApplicant: CoApplicant;
  loanPurpose: string;
  loanAmount: string;
  creditScoreRange: string;
  monthlyDebtPayments: string;
  hasRunningLoanOrCard: string;
  existingLoans: { id: string; loanType: string; emiAmount: string }[];
  hasAnyOverdue: string;
  overdueAmount: string;
  overdueLoanType: string;
  loanDefaultPast36Months: string;
  accountNpaWrittenOff: string;
  coApplicantOrGuarantor: string;
  preferredBankId: string;
  preferredBankName: string;
  loanPriorities: string[];
  loanPriority: string;
  certifyAccuracy: boolean;
  authorizeCredit: boolean;
  agreeTerms: boolean;
  consentCommunications: boolean;
  consentSignatureAgreed: boolean;
  customerSignature: string;
  submitAuthMethod: 'signature' | 'otp';
  signatureMode: 'draw' | 'upload';
  otpVerified: boolean;
};

export function createInitialFormData(): AssessmentFormData {
  return {
    title: '', firstName: '', middleName: '', lastName: '',
    dateOfBirth: '', gender: '', maritalStatus: '',
    email: '', phone: '', aadhaar: '', pan: '',
    addressLine1: '', addressLine2: '', city: '', district: '',
    state: '', pinCode: '', residenceType: '', yearsAtAddress: '', monthlyRent: '',
    employmentType: '', employerName: '', jobTitle: '', industry: '',
    yearsEmployed: '', annualIncome: '', monthlyIncome: '', employerPhone: '', retirementIncome: '',
    coApplicant: { ...INITIAL_CO_APPLICANT },
    loanPurpose: '', loanAmount: '', creditScoreRange: '',
    monthlyDebtPayments: '', hasRunningLoanOrCard: '', existingLoans: [],
    hasAnyOverdue: '', overdueAmount: '', overdueLoanType: '',
    ...FINANCIAL_HISTORY_INITIAL,
    preferredBankId: '', preferredBankName: '', loanPriorities: [], loanPriority: '',
    certifyAccuracy: false, authorizeCredit: false, agreeTerms: false, consentCommunications: false,
    consentSignatureAgreed: false, customerSignature: '', submitAuthMethod: 'otp',
    signatureMode: 'draw', otpVerified: false,
  };
}

export const ASSESSMENT_STEPS = [
  { id: 'personal', label: 'Personal' },
  { id: 'address', label: 'Address' },
  { id: 'employment', label: 'Employment' },
  { id: 'financial', label: 'Financial' },
  { id: 'preferences', label: 'Bank & priority' },
  { id: 'review', label: 'Review' },
  { id: 'documents', label: 'Documents' },
  { id: 'signature', label: 'Submit' },
];
