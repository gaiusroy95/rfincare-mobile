import { apiClient } from '../api/apiClient';
import { buildPostOfficeQueryParams } from '../utils/postOfficeFilters';
import type { PostOfficeFilters } from '../constants/postOfficeMarketplace';

export const postOfficeService = {
  async listActive(filters: Partial<PostOfficeFilters> = {}) {
    const params = buildPostOfficeQueryParams(filters);
    const res = await apiClient.get('/post-office-investments', { params });
    return res.data;
  },

  async calculate(payload: {
    calculatorType: string;
    principal?: number;
    monthlyDeposit?: number;
    annualDeposit?: number;
    annualRate?: number;
    tenureYears?: number;
  }) {
    const res = await apiClient.post('/post-office-investments/calculate', payload);
    return res.data;
  },
};

export type PostOfficeProduct = {
  id: string;
  providerName: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  categories?: string[];
  interestRate?: number | null;
  tenureMinMonths?: number | null;
  tenureMaxMonths?: number | null;
  minDepositAmount?: number | null;
  maxDepositAmount?: number | null;
  eligibilityText?: string | null;
  returnsSummary?: string | null;
  taxBenefitsText?: string | null;
  calculatorEnabled?: boolean;
  calculatorType?: string | null;
  applyUrl?: string | null;
  features?: string[];
  highlights?: string | null;
  displayPriority?: number;
  status?: string;
};

export type PostOfficeCalculateResult = {
  summary?: string;
  maturityValue?: number;
  totalInvested?: number;
  returnsAmount?: number;
  monthlyIncome?: number | null;
};
