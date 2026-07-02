import { apiClient } from '../api/apiClient';
import { buildInvestmentQueryParams } from '../utils/investmentMarketplaceFilters';
import type { InvestmentFilters } from '../constants/investmentMarketplace';

export const investmentProductService = {
  async listActive(filters: Partial<InvestmentFilters> = {}) {
    const params = buildInvestmentQueryParams(filters);
    const res = await apiClient.get('/investment-products', { params });
    return res.data;
  },

  async calculate(payload: {
    calculatorType?: string;
    investmentAmount?: number;
    annualReturn?: number;
    couponRate?: number;
    tenureYears?: number;
    tenureMonths?: number;
  }) {
    const res = await apiClient.post('/investment-products/calculate', payload);
    return res.data;
  },
};

export type InvestmentProduct = {
  id: string;
  providerName: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  categories?: string[];
  returns1y?: number | null;
  returns3y?: number | null;
  riskLevel?: string | null;
  expenseRatio?: number | null;
  minInvestmentAmount?: number | null;
  taxBenefitsText?: string | null;
  maturityTenureText?: string | null;
  applyUrl?: string | null;
  features?: string[];
  highlights?: string | null;
  displayPriority?: number;
  status?: string;
};
