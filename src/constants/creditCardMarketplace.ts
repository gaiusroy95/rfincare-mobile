/** Credit card marketplace taxonomy — mirrors backend/src/lib/creditCardTaxonomy.js */

export const CREDIT_CARD_CATEGORIES = [
  { slug: 'cashback', label: 'Cashback Cards' },
  { slug: 'travel', label: 'Travel Cards' },
  { slug: 'fuel', label: 'Fuel Cards' },
  { slug: 'airport_lounge', label: 'Airport Lounge Cards' },
  { slug: 'shopping', label: 'Shopping Cards' },
  { slug: 'premium', label: 'Premium Cards' },
  { slug: 'business', label: 'Business Cards' },
  { slug: 'student', label: 'Student Cards' },
  { slug: 'secured', label: 'Secured Credit Cards' },
  { slug: 'rupay', label: 'RuPay Credit Cards' },
  { slug: 'upi', label: 'UPI Credit Cards' },
  { slug: 'co_branded', label: 'Co-branded Credit Cards' },
];

export const ANNUAL_FEE_FILTER_OPTIONS = [
  { value: 'all', label: 'Any annual fee' },
  { value: 'free', label: 'Lifetime free (₹0)' },
  { value: '0-500', label: 'Up to ₹500' },
  { value: '500-2500', label: '₹500 – ₹2,500' },
  { value: '2500+', label: 'Above ₹2,500' },
];

export const JOINING_FEE_FILTER_OPTIONS = [
  { value: 'all', label: 'Any joining fee' },
  { value: 'free', label: 'No joining fee' },
  { value: '0-500', label: 'Up to ₹500' },
  { value: '500+', label: 'Above ₹500' },
];

export const FOREX_CHARGES_FILTER_OPTIONS = [
  { value: 'all', label: 'Any forex charges' },
  { value: 'zero', label: 'Zero / no markup' },
  { value: 'under_2', label: 'Under 2%' },
  { value: 'under_3', label: 'Under 3%' },
];

export const BENEFIT_FILTER_OPTIONS = [
  { key: 'rewardPoints', label: 'Reward Points' },
  { key: 'loungeAccess', label: 'Lounge Access' },
  { key: 'fuelSurchargeWaiver', label: 'Fuel Surcharge Waiver' },
  { key: 'movieBenefits', label: 'Movie Benefits' },
  { key: 'diningBenefits', label: 'Dining Benefits' },
  { key: 'insuranceCover', label: 'Insurance Cover' },
  { key: 'emiConversion', label: 'EMI Conversion' },
];

export const DEFAULT_CREDIT_CARD_FILTERS = {
  search: '',
  category: 'all',
  annualFee: 'all',
  joiningFee: 'all',
  forexCharges: 'all',
  rewardPoints: false,
  loungeAccess: false,
  fuelSurchargeWaiver: false,
  movieBenefits: false,
  diningBenefits: false,
  insuranceCover: false,
  emiConversion: false,
};

export function getCategoryLabel(slug: string) {
  return CREDIT_CARD_CATEGORIES.find((c) => c.slug === slug)?.label || slug;
}

export const COMPARE_TABLE_ROWS = [
  { key: 'annualFee', label: 'Annual fee', type: 'fee' as const },
  { key: 'joiningFee', label: 'Joining fee', type: 'fee' as const },
  { key: 'rewardPoints', label: 'Reward points', type: 'text' as const },
  { key: 'loungeAccess', label: 'Lounge access', type: 'benefit' as const, detailsKey: 'loungeAccessDetails' },
  { key: 'fuelSurchargeWaiver', label: 'Fuel surcharge waiver', type: 'boolean' as const },
  { key: 'movieBenefits', label: 'Movie benefits', type: 'benefit' as const, detailsKey: 'movieBenefitsDetails' },
  { key: 'diningBenefits', label: 'Dining benefits', type: 'benefit' as const, detailsKey: 'diningBenefitsDetails' },
  { key: 'insuranceCover', label: 'Insurance cover', type: 'benefit' as const, detailsKey: 'insuranceCoverDetails' },
  { key: 'forexCharges', label: 'Forex charges', type: 'text' as const },
  { key: 'emiConversion', label: 'EMI conversion', type: 'benefit' as const, detailsKey: 'emiConversionDetails' },
  { key: 'interestRate', label: 'Interest rate', type: 'percent' as const },
  { key: 'cardNetwork', label: 'Network', type: 'text' as const },
];

export type CreditCardFilters = typeof DEFAULT_CREDIT_CARD_FILTERS;
