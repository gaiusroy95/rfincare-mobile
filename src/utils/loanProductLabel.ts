// @ts-expect-error JS module
import { getLoanProductBySlug } from '@/src/constants/loanProducts';

function prettify(value?: string | null) {
  if (!value) return '';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Resolve a human-readable product name from a loan purpose / API key / slug. */
export function getLoanProductLabel(loanPurpose?: string | null): string {
  if (!loanPurpose) return '';
  const product = getLoanProductBySlug(loanPurpose);
  if (product?.label) return String(product.label);
  return prettify(loanPurpose);
}
