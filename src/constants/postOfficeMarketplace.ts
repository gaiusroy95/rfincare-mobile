export const POST_OFFICE_CATEGORIES = [
  { slug: 'ppf', label: 'PPF' },
  { slug: 'nsc', label: 'NSC' },
  { slug: 'kvp', label: 'KVP' },
  { slug: 'sukanya_samriddhi', label: 'Sukanya Samriddhi' },
  { slug: 'senior_citizen_savings', label: 'SCSS' },
  { slug: 'monthly_income_scheme', label: 'MIS' },
  { slug: 'time_deposit', label: 'TD' },
  { slug: 'recurring_deposit', label: 'RD' },
];

export type PostOfficeFilters = {
  search: string;
  category: string;
};

export const DEFAULT_POST_OFFICE_FILTERS: PostOfficeFilters = {
  search: '',
  category: 'all',
};

export function getCategoryLabel(slug: string) {
  return POST_OFFICE_CATEGORIES.find((c) => c.slug === slug)?.label || slug;
}
