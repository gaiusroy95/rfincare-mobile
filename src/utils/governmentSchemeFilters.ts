import type { GovernmentSchemeFilters } from '../constants/governmentSchemeMarketplace';
import { DEFAULT_GOVERNMENT_SCHEME_FILTERS } from '../constants/governmentSchemeMarketplace';

export function buildGovernmentSchemeQueryParams(filters: Partial<GovernmentSchemeFilters> = {}) {
  const params: Record<string, string> = {};
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.category && filters.category !== 'all') params.category = filters.category;
  return params;
}

export function resetGovernmentSchemeFilters() {
  return { ...DEFAULT_GOVERNMENT_SCHEME_FILTERS };
}

export function formatInterestRate(value?: number | null) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(2)}%`;
}

export function formatPercent(value?: number | null) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(1)}%`;
}

export function formatLoanAmount(scheme?: {
  loanAmountMin?: number | null;
  loanAmountMax?: number | null;
} | null) {
  if (!scheme) return '—';
  const min = scheme.loanAmountMin;
  const max = scheme.loanAmountMax;
  if (min != null && max != null) {
    return `₹${Number(min).toLocaleString('en-IN')} – ₹${Number(max).toLocaleString('en-IN')}`;
  }
  if (max != null) return `Up to ₹${Number(max).toLocaleString('en-IN')}`;
  if (min != null) return `From ₹${Number(min).toLocaleString('en-IN')}`;
  return '—';
}
