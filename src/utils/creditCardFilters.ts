import {
  DEFAULT_CREDIT_CARD_FILTERS,
  type CreditCardFilters,
} from '../constants/creditCardMarketplace';
import type { CreditCard } from '../services/creditCardService';

export function formatCardFee(value?: number | null) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  if (n === 0) return 'Free';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export function formatBenefitValue(card: CreditCard, key: keyof CreditCard, detailsKey?: keyof CreditCard) {
  if (!card?.[key]) return '—';
  const details = detailsKey ? card[detailsKey] : null;
  return details ? `Yes — ${details}` : 'Yes';
}

type CompareRow = {
  key: keyof CreditCard;
  label: string;
  type: 'fee' | 'percent' | 'boolean' | 'benefit' | 'text';
  detailsKey?: keyof CreditCard;
};

export function formatCompareCell(card: CreditCard, row: CompareRow) {
  if (!card) return '—';
  switch (row.type) {
    case 'fee':
      return formatCardFee(card[row.key] as number | null);
    case 'percent':
      return card[row.key] != null ? `${card[row.key]}%` : '—';
    case 'boolean':
      return card[row.key] ? 'Yes' : '—';
    case 'benefit':
      return formatBenefitValue(card, row.key, row.detailsKey);
    case 'text':
    default:
      return (card[row.key] as string) || '—';
  }
}

export function buildCreditCardQueryParams(filters: Partial<CreditCardFilters> = {}) {
  const params: Record<string, string> = {};
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.category && filters.category !== 'all') params.category = filters.category;
  if (filters.annualFee && filters.annualFee !== 'all') params.annualFee = filters.annualFee;
  if (filters.joiningFee && filters.joiningFee !== 'all') params.joiningFee = filters.joiningFee;
  if (filters.forexCharges && filters.forexCharges !== 'all') params.forexCharges = filters.forexCharges;

  const boolKeys = [
    'rewardPoints',
    'loungeAccess',
    'fuelSurchargeWaiver',
    'movieBenefits',
    'diningBenefits',
    'insuranceCover',
    'emiConversion',
  ] as const;
  for (const key of boolKeys) {
    if (filters[key]) params[key] = 'true';
  }
  return params;
}

export function countActiveFilters(filters: Partial<CreditCardFilters> = {}) {
  let count = 0;
  if (filters.search?.trim()) count += 1;
  if (filters.category && filters.category !== 'all') count += 1;
  if (filters.annualFee && filters.annualFee !== 'all') count += 1;
  if (filters.joiningFee && filters.joiningFee !== 'all') count += 1;
  if (filters.forexCharges && filters.forexCharges !== 'all') count += 1;
  const boolKeys = [
    'rewardPoints',
    'loungeAccess',
    'fuelSurchargeWaiver',
    'movieBenefits',
    'diningBenefits',
    'insuranceCover',
    'emiConversion',
  ] as const;
  for (const key of boolKeys) {
    if (filters[key]) count += 1;
  }
  return count;
}

export function resetCreditCardFilters(): CreditCardFilters {
  return { ...DEFAULT_CREDIT_CARD_FILTERS };
}
