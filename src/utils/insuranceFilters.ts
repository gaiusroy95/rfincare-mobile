import { DEFAULT_INSURANCE_FILTERS, type InsuranceFilters } from '../constants/insuranceMarketplace';
import type { InsuranceProduct } from '../services/insuranceService';

export function formatInr(value?: number | null) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export function formatPremiumRange(product: InsuranceProduct) {
  const from = product?.premiumFrom;
  const to = product?.premiumTo;
  if (from == null && to == null) return '—';
  const unit = product?.premiumUnit === 'monthly' ? '/mo' : '/yr';
  if (from != null && to != null && from !== to) return `${formatInr(from)} – ${formatInr(to)}${unit}`;
  return `${formatInr(from ?? to)}${unit}`;
}

export function formatSumInsuredRange(product: InsuranceProduct) {
  const from = product?.sumInsuredFrom;
  const to = product?.sumInsuredTo;
  if (from == null && to == null) return '—';
  if (from != null && to != null && from !== to) return `${formatInr(from)} – ${formatInr(to)}`;
  return formatInr(from ?? to);
}

export function formatCompareCell(product: InsuranceProduct, row: { key: keyof InsuranceProduct; type: string }) {
  if (!product) return '—';
  switch (row.type) {
    case 'currency': return formatInr(product[row.key] as number | null);
    case 'percent': return product[row.key] != null ? `${product[row.key]}%` : '—';
    case 'years': return product[row.key] != null ? `${product[row.key]} years` : '—';
    case 'days': return product[row.key] != null ? `${product[row.key]} days` : '—';
    case 'number': return product[row.key] != null ? String(product[row.key]) : '—';
    case 'boolean': return product[row.key] ? 'Yes' : '—';
    default: return String(product[row.key] || '—');
  }
}

export function buildInsuranceQueryParams(filters: Partial<InsuranceFilters> = {}) {
  const params: Record<string, string> = {};
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.segment && filters.segment !== 'all') params.segment = filters.segment;
  if (filters.category && filters.category !== 'all') params.category = filters.category;
  if (filters.service && filters.service !== 'all') params.service = filters.service;
  if (filters.premium && filters.premium !== 'all') params.premium = filters.premium;
  if (filters.sumInsured && filters.sumInsured !== 'all') params.sumInsured = filters.sumInsured;
  if (filters.taxBenefit80c) params.taxBenefit80c = 'true';
  if (filters.taxBenefit80d) params.taxBenefit80d = 'true';
  if (filters.claimSettlementMin) params.claimSettlementMin = filters.claimSettlementMin;
  return params;
}

export function countActiveFilters(filters: Partial<InsuranceFilters> = {}) {
  let count = 0;
  if (filters.search?.trim()) count += 1;
  if (filters.segment && filters.segment !== 'all') count += 1;
  if (filters.category && filters.category !== 'all') count += 1;
  if (filters.service && filters.service !== 'all') count += 1;
  if (filters.premium && filters.premium !== 'all') count += 1;
  if (filters.sumInsured && filters.sumInsured !== 'all') count += 1;
  if (filters.taxBenefit80c) count += 1;
  if (filters.taxBenefit80d) count += 1;
  if (filters.claimSettlementMin) count += 1;
  return count;
}

export function resetInsuranceFilters(): InsuranceFilters {
  return { ...DEFAULT_INSURANCE_FILTERS };
}

export function getServiceUrl(product: InsuranceProduct, service: string) {
  if (service === 'new_policy') return product?.newPolicyUrl;
  if (service === 'renewal') return product?.renewalUrl;
  if (service === 'claim_assistance') return product?.claimAssistanceUrl;
  return product?.newPolicyUrl;
}
