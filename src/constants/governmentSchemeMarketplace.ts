export const GOVERNMENT_SCHEME_CATEGORIES = [
  { slug: 'pm_mudra', label: 'PM Mudra' },
  { slug: 'pmegp', label: 'PMEGP' },
  { slug: 'stand_up_india', label: 'Stand-Up India' },
  { slug: 'startup_india', label: 'Startup India' },
  { slug: 'atal_pension_yojana', label: 'Atal Pension Yojana' },
  { slug: 'nps', label: 'NPS' },
  { slug: 'pmjjby', label: 'PMJJBY' },
  { slug: 'pmsby', label: 'PMSBY' },
  { slug: 'ayushman_bharat', label: 'Ayushman Bharat' },
  { slug: 'solar_subsidy', label: 'Solar Subsidy' },
  { slug: 'msme_subsidies', label: 'MSME Subsidies' },
  { slug: 'agriculture_subsidies', label: 'Agriculture Subsidies' },
];

export type GovernmentSchemeFilters = {
  search: string;
  category: string;
};

export const DEFAULT_GOVERNMENT_SCHEME_FILTERS: GovernmentSchemeFilters = {
  search: '',
  category: 'all',
};

export function getCategoryLabel(slug: string) {
  return GOVERNMENT_SCHEME_CATEGORIES.find((c) => c.slug === slug)?.label || slug;
}
