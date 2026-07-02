import type { InvestmentFilters } from '../constants/investmentMarketplace';
import { DEFAULT_INVESTMENT_FILTERS } from '../constants/investmentMarketplace';

export function buildInvestmentQueryParams(filters: Partial<InvestmentFilters> = {}) {
  const params: Record<string, string> = {};
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.category && filters.category !== 'all') params.category = filters.category;
  return params;
}

export function resetInvestmentFilters() {
  return { ...DEFAULT_INVESTMENT_FILTERS };
}

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

export function formatCurrency(value?: number | null) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `₹${n.toLocaleString('en-IN')}`;
}
