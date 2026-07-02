import { apiClient } from '../api/apiClient';
import { buildFixedIncomeQueryParams } from '../utils/fixedIncomeFilters';
import type { FixedIncomeFilters } from '../constants/fixedIncomeMarketplace';

export const fixedIncomeService = {
  async listActive(filters: Partial<FixedIncomeFilters> = {}) {
    const params = buildFixedIncomeQueryParams(filters);
    const res = await apiClient.get('/fixed-income', { params });
    return res.data;
  },
};

export type FixedIncomeProduct = {
  id: string;
  providerId?: string | null;
  providerName: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  categories?: string[];
  interestRate?: number | null;
  interestRateMin?: number | null;
  interestRateMax?: number | null;
  lockInMonths?: number | null;
  prematureWithdrawal?: boolean;
  monthlyInterest?: boolean;
  quarterlyInterest?: boolean;
  applyUrl?: string | null;
  features?: string[];
  highlights?: string | null;
  displayPriority?: number;
  status?: string;
};

