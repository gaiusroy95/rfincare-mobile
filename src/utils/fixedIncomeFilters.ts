import type { FixedIncomeFilters } from '../constants/fixedIncomeMarketplace';
import { DEFAULT_FIXED_INCOME_FILTERS } from '../constants/fixedIncomeMarketplace';

export function buildFixedIncomeQueryParams(filters: Partial<FixedIncomeFilters> = {}) {
  const params: Record<string, string> = {};
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.category && filters.category !== 'all') params.category = filters.category;
  return params;
}

export function resetFixedIncomeFilters() {
  return { ...DEFAULT_FIXED_INCOME_FILTERS };
}

export function formatInterestRate(value?: number | null) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(2)}%`;
}

export function formatMonths(value?: number | null) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '—';
  if (n % 12 === 0) return `${n / 12} yr`;
  return `${n} mo`;
}

export function formatBool(value?: boolean | null) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return '—';
}

