export type QuestionDef = {
  id: string;
  type: 'text' | 'number' | 'tel' | 'select' | 'checkbox';
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
};

export type QuestionSection = {
  id: string;
  title: string;
  description: string;
  questions: QuestionDef[];
};

export const QUESTIONNAIRE_SECTIONS: QuestionSection[] = [
  {
    id: 'employment',
    title: 'Employment Verification',
    description: 'Detailed information about your current employment status',
    questions: [
      { id: 'employer_name', type: 'text', label: 'Current Employer Name', placeholder: 'e.g., ABC Corporation', required: true },
      { id: 'job_title', type: 'text', label: 'Job Title/Position', placeholder: 'e.g., Senior Software Engineer', required: true },
      {
        id: 'employment_type', type: 'select', label: 'Employment Type', required: true,
        options: [
          { value: 'full_time', label: 'Full-Time Permanent' },
          { value: 'part_time', label: 'Part-Time' },
          { value: 'contract', label: 'Contract/Temporary' },
          { value: 'self_employed', label: 'Self-Employed' },
          { value: 'retired', label: 'Retired' },
        ],
      },
      { id: 'years_employed', type: 'number', label: 'Years with Current Employer', placeholder: 'e.g., 5', required: true },
      { id: 'employer_phone', type: 'tel', label: 'Employer Contact Number', placeholder: '10-digit number', required: true },
      { id: 'supervisor_name', type: 'text', label: 'Supervisor/Manager Name', placeholder: 'e.g., John Smith' },
    ],
  },
  {
    id: 'income',
    title: 'Income & Assets',
    description: 'Additional income sources and asset information',
    questions: [
      { id: 'additional_income', type: 'checkbox', label: 'I have additional sources of income' },
      { id: 'additional_income_sources', type: 'text', label: 'Additional Income Sources', placeholder: 'e.g., Rental, freelance' },
      { id: 'monthly_additional_income', type: 'number', label: 'Monthly Additional Income (₹)', placeholder: '0' },
      { id: 'savings_amount', type: 'number', label: 'Total Savings (₹)', required: true },
      { id: 'investment_portfolio', type: 'number', label: 'Investment Portfolio Value (₹)' },
      { id: 'real_estate_owned', type: 'text', label: 'Real Estate Owned', placeholder: 'Describe any property owned' },
    ],
  },
  {
    id: 'property',
    title: 'Property Details',
    description: 'Information about the property being financed',
    questions: [
      {
        id: 'property_type', type: 'select', label: 'Property Type', required: true,
        options: [
          { value: 'apartment', label: 'Apartment' },
          { value: 'independent_house', label: 'Independent House' },
          { value: 'plot', label: 'Plot/Land' },
          { value: 'commercial', label: 'Commercial' },
        ],
      },
      { id: 'property_address', type: 'text', label: 'Property Address', required: true },
      { id: 'property_value', type: 'number', label: 'Property Value (₹)', required: true },
      { id: 'down_payment', type: 'number', label: 'Down Payment (₹)', required: true },
      {
        id: 'property_use', type: 'select', label: 'Property Use', required: true,
        options: [
          { value: 'self_occupied', label: 'Self-occupied' },
          { value: 'rental', label: 'Rental/Investment' },
          { value: 'under_construction', label: 'Under construction' },
        ],
      },
      { id: 'occupancy_timeline', type: 'text', label: 'Expected Occupancy Timeline', placeholder: 'e.g., 6 months' },
    ],
  },
  {
    id: 'obligations',
    title: 'Financial Obligations',
    description: 'Existing debts and monthly obligations',
    questions: [
      { id: 'existing_mortgage', type: 'number', label: 'Existing Mortgage Balance (₹)' },
      { id: 'monthly_mortgage_payment', type: 'number', label: 'Monthly Mortgage Payment (₹)' },
      { id: 'auto_loans', type: 'number', label: 'Auto Loan EMI (₹)' },
      { id: 'student_loans', type: 'number', label: 'Education Loan EMI (₹)' },
      { id: 'credit_card_debt', type: 'number', label: 'Credit Card Outstanding (₹)' },
      { id: 'other_obligations', type: 'text', label: 'Other Obligations', placeholder: 'Describe other monthly payments' },
    ],
  },
  {
    id: 'references',
    title: 'References & Authorization',
    description: 'Personal references and consent for verification',
    questions: [
      { id: 'reference1_name', type: 'text', label: 'Reference 1 — Name', required: true },
      { id: 'reference1_phone', type: 'tel', label: 'Reference 1 — Phone', required: true },
      { id: 'reference1_relationship', type: 'text', label: 'Reference 1 — Relationship', required: true },
      { id: 'reference2_name', type: 'text', label: 'Reference 2 — Name' },
      { id: 'reference2_phone', type: 'tel', label: 'Reference 2 — Phone' },
      { id: 'reference2_relationship', type: 'text', label: 'Reference 2 — Relationship' },
      { id: 'authorization_consent', type: 'checkbox', label: 'I authorize verification of the information provided', required: true },
      { id: 'credit_check_consent', type: 'checkbox', label: 'I consent to additional credit checks by the selected bank', required: true },
    ],
  },
];
