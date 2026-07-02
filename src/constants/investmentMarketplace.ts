export const INVESTMENT_CATEGORIES = [
  { slug: 'sovereign_gold_bonds', label: 'Sovereign Gold Bonds' },
  { slug: 'digital_gold', label: 'Digital Gold' },
  { slug: 'gold_etf', label: 'Gold ETF' },
  { slug: 'silver_etf', label: 'Silver ETF' },
  { slug: 'bonds', label: 'Bonds' },
  { slug: 'rbi_floating_bonds', label: 'RBI Floating Bonds' },
  { slug: 'government_securities', label: 'Government Securities' },
  { slug: 'treasury_bills', label: 'Treasury Bills' },
  { slug: 'corporate_bonds', label: 'Corporate Bonds' },
  { slug: 'reit', label: 'REIT' },
  { slug: 'invit', label: 'InvIT' },
];

export const RISK_LEVELS = [
  { slug: 'low', label: 'Low' },
  { slug: 'low_to_moderate', label: 'Low to Moderate' },
  { slug: 'moderate', label: 'Moderate' },
  { slug: 'moderately_high', label: 'Moderately High' },
  { slug: 'high', label: 'High' },
];

export type InvestmentFilters = {
  search: string;
  category: string;
};

export const DEFAULT_INVESTMENT_FILTERS: InvestmentFilters = {
  search: '',
  category: 'all',
};

export function getCategoryLabel(slug: string) {
  return INVESTMENT_CATEGORIES.find((c) => c.slug === slug)?.label || slug;
}

export function getRiskLabel(slug: string) {
  return RISK_LEVELS.find((r) => r.slug === slug)?.label || slug;
}
