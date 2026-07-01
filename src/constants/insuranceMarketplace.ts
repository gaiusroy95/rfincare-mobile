export const INSURANCE_SEGMENTS = [
  { slug: 'life', label: 'Life Insurance' },
  { slug: 'health', label: 'Health Insurance' },
  { slug: 'motor', label: 'Motor Insurance' },
];

export const INSURANCE_CATEGORIES = [
  { slug: 'term_insurance', label: 'Term Insurance', segment: 'life' },
  { slug: 'whole_life', label: 'Whole Life', segment: 'life' },
  { slug: 'endowment', label: 'Endowment', segment: 'life' },
  { slug: 'ulip', label: 'ULIP', segment: 'life' },
  { slug: 'child_plans', label: 'Child Plans', segment: 'life' },
  { slug: 'retirement_plans', label: 'Retirement Plans', segment: 'life' },
  { slug: 'pension_plans', label: 'Pension Plans', segment: 'life' },
  { slug: 'guaranteed_income_plans', label: 'Guaranteed Income Plans', segment: 'life' },
  { slug: 'individual', label: 'Individual', segment: 'health' },
  { slug: 'family_floater', label: 'Family Floater', segment: 'health' },
  { slug: 'senior_citizen', label: 'Senior Citizen', segment: 'health' },
  { slug: 'critical_illness', label: 'Critical Illness', segment: 'health' },
  { slug: 'cancer_cover', label: 'Cancer Cover', segment: 'health' },
  { slug: 'diabetes_cover', label: 'Diabetes Cover', segment: 'health' },
  { slug: 'opd_plans', label: 'OPD Plans', segment: 'health' },
  { slug: 'maternity_plans', label: 'Maternity Plans', segment: 'health' },
  { slug: 'personal_accident', label: 'Personal Accident', segment: 'health' },
  { slug: 'car_insurance', label: 'Car Insurance', segment: 'motor' },
  { slug: 'bike_insurance', label: 'Bike Insurance', segment: 'motor' },
  { slug: 'commercial_vehicle', label: 'Commercial Vehicle', segment: 'motor' },
  { slug: 'taxi_insurance', label: 'Taxi Insurance', segment: 'motor' },
  { slug: 'ev_insurance', label: 'EV Insurance', segment: 'motor' },
];

export const INSURANCE_SERVICES = [
  { slug: 'new_policy', label: 'New Policy' },
  { slug: 'renewal', label: 'Renewal' },
  { slug: 'claim_assistance', label: 'Claim Assistance' },
];

export const PREMIUM_FILTER_OPTIONS = [
  { value: 'all', label: 'Any premium' },
  { value: '0-5000', label: 'Up to ₹5,000/yr' },
  { value: '5000-15000', label: '₹5,000 – ₹15,000/yr' },
  { value: '15000-50000', label: '₹15,000 – ₹50,000/yr' },
  { value: '50000+', label: 'Above ₹50,000/yr' },
];

export const SUM_INSURED_FILTER_OPTIONS = [
  { value: 'all', label: 'Any sum insured' },
  { value: '0-500000', label: 'Up to ₹5 Lakh' },
  { value: '500000-2500000', label: '₹5 L – ₹25 L' },
  { value: '2500000-10000000', label: '₹25 L – ₹1 Cr' },
  { value: '10000000+', label: 'Above ₹1 Cr' },
];

export const DEFAULT_INSURANCE_FILTERS = {
  search: '',
  segment: 'all',
  category: 'all',
  service: 'all',
  premium: 'all',
  sumInsured: 'all',
  taxBenefit80c: false,
  taxBenefit80d: false,
  claimSettlementMin: '',
};

export type InsuranceFilters = typeof DEFAULT_INSURANCE_FILTERS;

export function getCategoriesForSegment(segment?: string | null) {
  if (!segment || segment === 'all') return INSURANCE_CATEGORIES;
  return INSURANCE_CATEGORIES.filter((c) => c.segment === segment);
}

export function getCategoryLabel(slug: string) {
  for (const cat of INSURANCE_CATEGORIES) {
    if (cat.slug === slug) return cat.label;
  }
  return slug;
}

export function getSegmentLabel(slug: string) {
  for (const seg of INSURANCE_SEGMENTS) {
    if (seg.slug === slug) return seg.label;
  }
  return slug;
}

export const COMPARE_TABLE_ROWS = [
  { key: 'premiumFrom' as const, label: 'Premium from', type: 'currency' as const },
  { key: 'sumInsuredFrom' as const, label: 'Sum insured from', type: 'currency' as const },
  { key: 'coverageTermYears' as const, label: 'Coverage term', type: 'years' as const },
  { key: 'waitingPeriodDays' as const, label: 'Waiting period', type: 'days' as const },
  { key: 'claimSettlementRatio' as const, label: 'Claim settlement', type: 'percent' as const },
  { key: 'cashlessHospitals' as const, label: 'Cashless hospitals', type: 'number' as const },
  { key: 'taxBenefit80c' as const, label: 'Tax benefit 80C', type: 'boolean' as const },
  { key: 'taxBenefit80d' as const, label: 'Tax benefit 80D', type: 'boolean' as const },
];
