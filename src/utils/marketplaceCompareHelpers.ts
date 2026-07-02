import { formatPremiumRange, formatSumInsuredRange, getServiceUrl } from '@/src/utils/insuranceFilters';
import { formatPercent, formatExpenseRatio } from '@/src/utils/mutualFundFilters';
import { formatCardFee } from '@/src/utils/creditCardFilters';
import { formatBool, formatInterestRate, formatMonths } from '@/src/utils/fixedIncomeFilters';
import { formatCurrency as formatPostOfficeCurrency, formatInterestRate as formatPostOfficeRate } from '@/src/utils/postOfficeFilters';
import { formatInterestRate as formatSchemeRate, formatLoanAmount, formatPercent as formatSchemePercent } from '@/src/utils/governmentSchemeFilters';
import { formatPercent as formatInvestmentPercent, formatExpenseRatio as formatInvestmentExpenseRatio, formatCurrency as formatInvestmentCurrency } from '@/src/utils/investmentMarketplaceFilters';
import { getRiskLabel } from '@/src/constants/mutualFundMarketplace';
import { getRiskLabel as getInvestmentRiskLabel } from '@/src/constants/investmentMarketplace';
import type { CompareProductColumn, CompareSpecRow } from '@/src/components/marketplace/MarketplaceCompareView';
// @ts-expect-error JS module
import { resolveBankLogoUrl } from '@/src/utils/bankBranding';

export function buildInsuranceCompareColumns(products: Record<string, unknown>[], service = 'new_policy'): CompareProductColumn[] {
  return products.map((p) => ({
    id: String(p.id),
    title: String(p.name || ''),
    subtitle: String(p.insurerName || ''),
    badge: p.displayPriority && Number(p.displayPriority) >= 80 ? 'Best price' : null,
    imageUri: resolveBankLogoUrl(p.logoUrl as string) || undefined,
    metrics: [
      { label: 'Premium', value: formatPremiumRange(p) },
      { label: 'Cover', value: formatSumInsuredRange(p) },
      { label: 'CSR', value: p.claimSettlementRatio != null ? `${p.claimSettlementRatio}%` : '—' },
    ],
    features: [...((p.features as string[]) || []), ...((p.benefits as string[]) || [])].slice(0, 5),
    price: formatPremiumRange(p),
    priceLabel: p.premiumUnit === 'monthly' ? '/month' : '/year',
    savingsText: p.taxBenefit80d ? '80D benefit' : null,
    ctaUrl: getServiceUrl(p, service) || null,
    ctaLabel: 'View Plan',
  }));
}

export function buildInsuranceSpecRows(products: Record<string, unknown>[]): CompareSpecRow[] {
  const rows = [
    { label: 'Waiting period', key: 'waitingPeriodDays', fmt: (v: unknown) => (v != null ? `${v} days` : '—') },
    { label: 'Cashless hospitals', key: 'cashlessHospitals', fmt: (v: unknown) => (v != null ? String(v) : '—') },
  ];
  return rows.map((row) => ({
    label: row.label,
    values: Object.fromEntries(products.map((p) => [String(p.id), row.fmt(p[row.key])])),
  }));
}

export function buildMutualFundCompareColumns(products: Record<string, unknown>[]): CompareProductColumn[] {
  return products.map((p) => ({
    id: String(p.id),
    title: String(p.name || ''),
    subtitle: String(p.amcName || ''),
    badge: p.rating && Number(p.rating) >= 4.5 ? 'Top rated' : null,
    imageUri: resolveBankLogoUrl(p.logoUrl as string) || undefined,
    metrics: [
      { label: '3Y', value: formatPercent(p.returns3y) },
      { label: 'Risk', value: p.riskLevel ? getRiskLabel(String(p.riskLevel)) : '—' },
      { label: 'TER', value: formatExpenseRatio(p.expenseRatio) },
    ],
    features: ((p.features as string[]) || []).slice(0, 5),
    price: p.minSipAmount ? `₹${Number(p.minSipAmount).toLocaleString('en-IN')}` : formatPercent(p.returns1y),
    priceLabel: p.minSipAmount ? 'SIP/mo' : '1Y return',
    ctaUrl: (p.investUrl as string) || null,
    ctaLabel: 'Invest',
  }));
}

export function buildMutualFundSpecRows(products: Record<string, unknown>[]): CompareSpecRow[] {
  const rows = [
    { label: '1Y Returns', key: 'returns1y', fmt: (v: unknown) => formatPercent(v) },
    { label: '5Y Returns', key: 'returns5y', fmt: (v: unknown) => formatPercent(v) },
  ];
  return rows.map((row) => ({
    label: row.label,
    values: Object.fromEntries(products.map((p) => [String(p.id), row.fmt(p[row.key])])),
  }));
}

export function buildFixedIncomeCompareColumns(products: Record<string, unknown>[]): CompareProductColumn[] {
  return products.map((p) => {
    const rate = p.interestRate ?? p.interestRateMax ?? p.interestRateMin;
    return {
      id: String(p.id),
      title: String(p.name || ''),
      subtitle: String(p.providerName || ''),
      badge: rate != null ? 'Rate' : null,
      imageUri: resolveBankLogoUrl(p.logoUrl as string) || undefined,
      metrics: [
        { label: 'Rate', value: formatInterestRate(rate as number) },
        { label: 'Lock-in', value: formatMonths(p.lockInMonths as number) },
        { label: 'Premature', value: formatBool(p.prematureWithdrawal as boolean) },
      ],
      features: ((p.features as string[]) || []).slice(0, 5),
      price: formatInterestRate(rate as number),
      priceLabel: 'p.a.',
      ctaUrl: (p.applyUrl as string) || null,
      ctaLabel: 'Apply',
    };
  });
}

export function buildFixedIncomeSpecRows(products: Record<string, unknown>[]): CompareSpecRow[] {
  const rows = [
    { label: 'Interest Rate', key: 'interestRate', fmt: (_v: unknown, p: Record<string, unknown>) => formatInterestRate((p.interestRate ?? p.interestRateMax ?? p.interestRateMin) as number) },
    { label: 'Lock-in', key: 'lockInMonths', fmt: (v: unknown) => formatMonths(v as number) },
    { label: 'Premature Withdrawal', key: 'prematureWithdrawal', fmt: (v: unknown) => formatBool(v as boolean) },
    { label: 'Monthly Interest', key: 'monthlyInterest', fmt: (v: unknown) => formatBool(v as boolean) },
    { label: 'Quarterly Interest', key: 'quarterlyInterest', fmt: (v: unknown) => formatBool(v as boolean) },
  ];
  return rows.map((row) => ({
    label: row.label,
    values: Object.fromEntries(
      products.map((p) => [
        String(p.id),
        row.fmt(p[row.key], p),
      ]),
    ),
  }));
}

export function buildPostOfficeCompareColumns(products: Record<string, unknown>[]): CompareProductColumn[] {
  return products.map((p) => ({
    id: String(p.id),
    title: String(p.name || ''),
    subtitle: String(p.providerName || 'India Post'),
    badge: p.interestRate != null ? 'Rate' : null,
    imageUri: resolveBankLogoUrl(p.logoUrl as string) || undefined,
    metrics: [
      { label: 'Rate', value: formatPostOfficeRate(p.interestRate as number) },
      { label: 'Tenure', value: formatMonths((p.tenureMaxMonths ?? p.tenureMinMonths) as number) },
      { label: 'Min deposit', value: formatPostOfficeCurrency(p.minDepositAmount as number) },
    ],
    features: ((p.features as string[]) || []).slice(0, 5),
    price: formatPostOfficeRate(p.interestRate as number),
    priceLabel: 'p.a.',
    ctaUrl: (p.applyUrl as string) || null,
    ctaLabel: 'Apply',
  }));
}

export function buildPostOfficeSpecRows(products: Record<string, unknown>[]): CompareSpecRow[] {
  const rows = [
    { label: 'Eligibility', key: 'eligibilityText', fmt: (v: unknown) => (v ? String(v) : '—') },
    { label: 'Returns', key: 'returnsSummary', fmt: (v: unknown) => (v ? String(v) : '—') },
    { label: 'Tax Benefits', key: 'taxBenefitsText', fmt: (v: unknown) => (v ? String(v) : '—') },
    { label: 'Min Deposit', key: 'minDepositAmount', fmt: (v: unknown) => formatPostOfficeCurrency(v as number) },
    { label: 'Tenure', key: 'tenureMaxMonths', fmt: (_v: unknown, p: Record<string, unknown>) => formatMonths((p.tenureMaxMonths ?? p.tenureMinMonths) as number) },
  ];
  return rows.map((row) => ({
    label: row.label,
    values: Object.fromEntries(
      products.map((p) => [String(p.id), row.fmt(p[row.key], p)]),
    ),
  }));
}

export function buildGovernmentSchemeCompareColumns(products: Record<string, unknown>[]): CompareProductColumn[] {
  return products.map((p) => ({
    id: String(p.id),
    title: String(p.name || ''),
    subtitle: String(p.ministryName || ''),
    badge: p.subsidyPercent != null ? 'Subsidy' : null,
    imageUri: resolveBankLogoUrl(p.logoUrl as string) || undefined,
    metrics: [
      { label: 'Loan / Subsidy', value: formatLoanAmount(p as { loanAmountMin?: number; loanAmountMax?: number }) },
      { label: 'Interest', value: formatSchemeRate(p.interestRate as number) },
      { label: 'Subsidy', value: formatSchemePercent(p.subsidyPercent as number) },
    ],
    features: ((p.features as string[]) || []).slice(0, 5),
    price: formatSchemeRate(p.interestRate as number),
    priceLabel: 'p.a.',
    ctaUrl: (p.applicationUrl as string) || null,
    ctaLabel: 'Apply',
  }));
}

export function buildGovernmentSchemeSpecRows(products: Record<string, unknown>[]): CompareSpecRow[] {
  const rows = [
    { label: 'Eligibility', key: 'eligibilityText', fmt: (v: unknown) => (v ? String(v) : '—') },
    { label: 'Benefits', key: 'benefitsText', fmt: (v: unknown) => (v ? String(v) : '—') },
    { label: 'Loan / Subsidy', key: 'loanAmount', fmt: (_v: unknown, p: Record<string, unknown>) => formatLoanAmount(p as { loanAmountMin?: number; loanAmountMax?: number }) },
    { label: 'Interest Rate', key: 'interestRate', fmt: (v: unknown) => formatSchemeRate(v as number) },
    { label: 'Subsidy %', key: 'subsidyPercent', fmt: (v: unknown) => formatSchemePercent(v as number) },
  ];
  return rows.map((row) => ({
    label: row.label,
    values: Object.fromEntries(
      products.map((p) => [String(p.id), row.fmt(p[row.key], p)]),
    ),
  }));
}

export function buildInvestmentCompareColumns(products: Record<string, unknown>[]): CompareProductColumn[] {
  return products.map((p) => ({
    id: String(p.id),
    title: String(p.name || ''),
    subtitle: String(p.providerName || ''),
    badge: p.returns3y != null ? '3Y Returns' : null,
    imageUri: resolveBankLogoUrl(p.logoUrl as string) || undefined,
    metrics: [
      { label: '1Y', value: formatInvestmentPercent(p.returns1y as number) },
      { label: '3Y', value: formatInvestmentPercent(p.returns3y as number) },
      { label: 'Risk', value: p.riskLevel ? getInvestmentRiskLabel(String(p.riskLevel)) : '—' },
    ],
    features: ((p.features as string[]) || []).slice(0, 5),
    price: p.minInvestmentAmount ? formatInvestmentCurrency(p.minInvestmentAmount as number) : formatInvestmentPercent(p.returns1y as number),
    priceLabel: p.minInvestmentAmount ? 'min invest' : '1Y return',
    ctaUrl: (p.applyUrl as string) || null,
    ctaLabel: 'Invest',
  }));
}

export function buildInvestmentSpecRows(products: Record<string, unknown>[]): CompareSpecRow[] {
  const rows = [
    { label: '1Y Returns', key: 'returns1y', fmt: (v: unknown) => formatInvestmentPercent(v as number) },
    { label: '3Y Returns', key: 'returns3y', fmt: (v: unknown) => formatInvestmentPercent(v as number) },
    { label: 'Risk', key: 'riskLevel', fmt: (v: unknown) => (v ? getInvestmentRiskLabel(String(v)) : '—') },
    { label: 'Min Investment', key: 'minInvestmentAmount', fmt: (v: unknown) => formatInvestmentCurrency(v as number) },
    { label: 'Expense Ratio', key: 'expenseRatio', fmt: (v: unknown) => formatInvestmentExpenseRatio(v as number) },
    { label: 'Tax Benefits', key: 'taxBenefitsText', fmt: (v: unknown) => (v ? String(v) : '—') },
  ];
  return rows.map((row) => ({
    label: row.label,
    values: Object.fromEntries(
      products.map((p) => [String(p.id), row.fmt(p[row.key])]),
    ),
  }));
}
