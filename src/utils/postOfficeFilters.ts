import type { PostOfficeFilters } from '../constants/postOfficeMarketplace';
import { DEFAULT_POST_OFFICE_FILTERS } from '../constants/postOfficeMarketplace';

export function buildPostOfficeQueryParams(filters: Partial<PostOfficeFilters> = {}) {
  const params: Record<string, string> = {};
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.category && filters.category !== 'all') params.category = filters.category;
  return params;
}

export function resetPostOfficeFilters() {
  return { ...DEFAULT_POST_OFFICE_FILTERS };
}

export function formatCurrency(value?: number | null) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
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
