import type { AssessmentFormData } from './types';

export function validateStep(step: number, form: AssessmentFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  const req = (key: keyof AssessmentFormData, label: string) => {
    const v = form[key];
    if (v === '' || v === null || v === undefined) errors[key as string] = `${label} is required`;
  };

  switch (step) {
    case 0:
      req('firstName', 'First name');
      req('lastName', 'Last name');
      req('email', 'Email');
      req('phone', 'Phone');
      if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\D/g, '').slice(-10))) {
        errors.phone = 'Enter a valid 10-digit mobile number';
      }
      req('dateOfBirth', 'Date of birth');
      req('gender', 'Gender');
      req('aadhaar', 'Aadhaar (last 4 digits)');
      if (form.aadhaar && !/^\d{4}$/.test(form.aadhaar.replace(/\D/g, ''))) {
        errors.aadhaar = 'Enter the last 4 digits of your Aadhaar';
      }
      req('pan', 'PAN');
      if (form.pan && !/^[A-Z]{5}\d{4}[A-Z]$/i.test(form.pan)) {
        errors.pan = 'Enter a valid PAN (e.g. ABCDE1234F)';
      }
      break;
    case 1:
      req('addressLine1', 'Address');
      req('city', 'City');
      req('state', 'State');
      req('pinCode', 'PIN code');
      if (form.pinCode && !/^\d{6}$/.test(form.pinCode)) errors.pinCode = 'PIN must be 6 digits';
      if (form.residenceType === 'rented') req('monthlyRent', 'Monthly rent');
      break;
    case 2:
      req('employmentType', 'Employment type');
      if (form.employmentType !== 'retired') {
        req('employerName', 'Employer name');
        req('monthlyIncome', 'Monthly income');
      } else {
        req('retirementIncome', 'Retirement income');
      }
      break;
    case 3:
      req('loanPurpose', 'Loan purpose');
      req('loanAmount', 'Loan amount');
      req('creditScoreRange', 'Credit score range');
      req('hasRunningLoanOrCard', 'Existing loans question');
      if (form.hasRunningLoanOrCard === 'yes') {
        const loans = form.existingLoans || [];
        if (!loans.length || loans.every((l) => !l.loanType)) {
          errors.existingLoans = 'Add at least one running loan or EMI';
        }
      }
      break;
    case 4:
      if (!form.loanPriorities?.length) {
        errors.loanPriority = 'Select at least one loan priority';
      }
      break;
    case 5:
      if (!form.certifyAccuracy) errors.certifyAccuracy = 'Required';
      if (!form.authorizeCredit) errors.authorizeCredit = 'Required';
      if (!form.agreeTerms) errors.agreeTerms = 'Required';
      break;
    default:
      break;
  }
  return errors;
}
