export const FIXED_INCOME_CATEGORIES = [
  { slug: 'fixed_deposits', label: 'Fixed Deposits' },
  { slug: 'corporate_fd', label: 'Corporate FD' },
  { slug: 'nbfc_fd', label: 'NBFC FD' },
  { slug: 'senior_citizen_fd', label: 'Senior Citizen FD' },
  { slug: 'tax_saving_fd', label: 'Tax Saving FD' },
  { slug: 'recurring_deposit', label: 'Recurring Deposit' },
];

export type FixedIncomeFilters = {
  search: string;
  category: string;
};

export const DEFAULT_FIXED_INCOME_FILTERS: FixedIncomeFilters = {
  search: '',
  category: 'all',
};

export function getCategoryLabel(slug: string) {
  return FIXED_INCOME_CATEGORIES.find((c) => c.slug === slug)?.label || slug;
}

