export const MUTUAL_FUND_CATEGORIES = [
  { slug: 'sip', label: 'SIP' },
  { slug: 'lumpsum', label: 'Lumpsum' },
  { slug: 'elss', label: 'ELSS' },
  { slug: 'debt_funds', label: 'Debt Funds' },
  { slug: 'liquid_funds', label: 'Liquid Funds' },
  { slug: 'hybrid_funds', label: 'Hybrid Funds' },
  { slug: 'flexi_cap', label: 'Flexi Cap' },
  { slug: 'mid_cap', label: 'Mid Cap' },
  { slug: 'small_cap', label: 'Small Cap' },
  { slug: 'large_cap', label: 'Large Cap' },
  { slug: 'index_funds', label: 'Index Funds' },
  { slug: 'etf', label: 'ETF' },
  { slug: 'international_funds', label: 'International Funds' },
];

export const RISK_LEVELS = [
  { slug: 'low', label: 'Low' },
  { slug: 'low_to_moderate', label: 'Low to Moderate' },
  { slug: 'moderate', label: 'Moderate' },
  { slug: 'moderately_high', label: 'Moderately High' },
  { slug: 'high', label: 'High' },
  { slug: 'very_high', label: 'Very High' },
];

export const RETURNS_FILTER_OPTIONS = [
  { value: 'all', label: 'Any returns' },
  { value: '1y_10+', label: '1Y above 10%' },
  { value: '1y_15+', label: '1Y above 15%' },
  { value: '3y_12+', label: '3Y above 12%' },
  { value: '5y_12+', label: '5Y above 12%' },
];

export const EXPENSE_RATIO_OPTIONS = [
  { value: 'all', label: 'Any expense ratio' },
  { value: '0-0.5', label: 'Up to 0.5%' },
  { value: '0.5-1', label: '0.5% – 1%' },
  { value: '1-1.5', label: '1% – 1.5%' },
  { value: '1.5+', label: 'Above 1.5%' },
];

export const RATING_FILTER_OPTIONS = [
  { value: 'all', label: 'Any rating' },
  { value: '4+', label: '4★ and above' },
  { value: '4.5+', label: '4.5★ and above' },
  { value: '5', label: '5★ only' },
];

export const DEFAULT_MUTUAL_FUND_FILTERS = {
  search: '',
  category: 'all',
  riskLevel: 'all',
  returns: 'all',
  expenseRatio: 'all',
  rating: 'all',
  supportsSip: false,
  supportsLumpsum: false,
};

export type MutualFundFilters = typeof DEFAULT_MUTUAL_FUND_FILTERS;

export const COMPARE_TABLE_ROWS = [
  { key: 'returns1y' as const, label: '1Y Returns', type: 'percent' as const },
  { key: 'returns3y' as const, label: '3Y Returns', type: 'percent' as const },
  { key: 'returns5y' as const, label: '5Y Returns', type: 'percent' as const },
  { key: 'riskLevel' as const, label: 'Risk', type: 'risk' as const },
  { key: 'expenseRatio' as const, label: 'Expense Ratio', type: 'expense' as const },
  { key: 'fundManager' as const, label: 'Fund Manager', type: 'text' as const },
  { key: 'aumCrores' as const, label: 'AUM', type: 'aum' as const },
  { key: 'rating' as const, label: 'Rating', type: 'rating' as const },
];

export function getCategoryLabel(slug: string) {
  for (const cat of MUTUAL_FUND_CATEGORIES) {
    if (cat.slug === slug) return cat.label;
  }
  return slug;
}

export function getRiskLabel(slug: string) {
  for (const risk of RISK_LEVELS) {
    if (risk.slug === slug) return risk.label;
  }
  return slug;
}
