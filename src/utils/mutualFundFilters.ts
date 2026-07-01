import { DEFAULT_MUTUAL_FUND_FILTERS, getRiskLabel, type MutualFundFilters } from '../constants/mutualFundMarketplace';
import type { MutualFund } from '../services/mutualFundService';

export function formatPercent(value?: number | null) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(2)}%`;
}

export function formatExpenseRatio(value?: number | null) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(2)}%`;
}

export function formatAum(value?: number | null) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k Cr`;
  return `₹${n.toLocaleString('en-IN')} Cr`;
}

export function formatRating(value?: number | null) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(1)} ★`;
}

export function formatCompareCell(fund: MutualFund, row: { key: keyof MutualFund; type: string }) {
  if (!fund) return '—';
  switch (row.type) {
    case 'percent': return formatPercent(fund[row.key] as number | null);
    case 'expense': return formatExpenseRatio(fund[row.key] as number | null);
    case 'aum': return formatAum(fund[row.key] as number | null);
    case 'rating': return formatRating(fund[row.key] as number | null);
    case 'risk': return fund.riskLevel ? getRiskLabel(fund.riskLevel) : '—';
    case 'text':
    default: return String(fund[row.key] || '—');
  }
}

export function buildMutualFundQueryParams(filters: Partial<MutualFundFilters> = {}) {
  const params: Record<string, string> = {};
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.category && filters.category !== 'all') params.category = filters.category;
  if (filters.riskLevel && filters.riskLevel !== 'all') params.riskLevel = filters.riskLevel;
  if (filters.returns && filters.returns !== 'all') params.returns = filters.returns;
  if (filters.expenseRatio && filters.expenseRatio !== 'all') params.expenseRatio = filters.expenseRatio;
  if (filters.rating && filters.rating !== 'all') params.rating = filters.rating;
  if (filters.supportsSip) params.supportsSip = 'true';
  if (filters.supportsLumpsum) params.supportsLumpsum = 'true';
  return params;
}

export function countActiveFilters(filters: Partial<MutualFundFilters> = {}) {
  let count = 0;
  if (filters.search?.trim()) count += 1;
  if (filters.category && filters.category !== 'all') count += 1;
  if (filters.riskLevel && filters.riskLevel !== 'all') count += 1;
  if (filters.returns && filters.returns !== 'all') count += 1;
  if (filters.expenseRatio && filters.expenseRatio !== 'all') count += 1;
  if (filters.rating && filters.rating !== 'all') count += 1;
  if (filters.supportsSip) count += 1;
  if (filters.supportsLumpsum) count += 1;
  return count;
}

export function resetMutualFundFilters(): MutualFundFilters {
  return { ...DEFAULT_MUTUAL_FUND_FILTERS };
}
