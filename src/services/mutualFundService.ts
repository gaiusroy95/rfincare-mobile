import { apiClient } from '../api/apiClient';
import { buildMutualFundQueryParams } from '../utils/mutualFundFilters';
import type { MutualFundFilters } from '../constants/mutualFundMarketplace';

export const mutualFundService = {
  async listActive(filters: Partial<MutualFundFilters> = {}) {
    const params = buildMutualFundQueryParams(filters);
    const res = await apiClient.get('/mutual-funds', { params });
    return res.data;
  },

  async listAll(filters: Partial<MutualFundFilters> = {}) {
    const params = { includeInactive: 'true', ...buildMutualFundQueryParams(filters) };
    const res = await apiClient.get('/mutual-funds', { params });
    return res.data;
  },

  async getTaxonomy() {
    const res = await apiClient.get('/mutual-funds/taxonomy');
    return res.data;
  },

  async getById(id: string) {
    const res = await apiClient.get(`/mutual-funds/${id}`);
    return res.data;
  },

  async calculate(payload: {
    investmentMode?: 'sip' | 'lumpsum';
    monthlyInvestment?: number;
    lumpsumAmount?: number;
    expectedReturn?: number;
    expenseRatio?: number;
    tenureYears?: number;
  }) {
    const res = await apiClient.post('/mutual-funds/calculate', payload);
    return res.data;
  },
};

export type MutualFund = {
  id: string;
  amcId?: string | null;
  amcName: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  categories?: string[];
  returns1y?: number | null;
  returns3y?: number | null;
  returns5y?: number | null;
  riskLevel?: string | null;
  expenseRatio?: number | null;
  fundManager?: string | null;
  aumCrores?: number | null;
  rating?: number | null;
  minSipAmount?: number | null;
  minLumpsumAmount?: number | null;
  supportsSip?: boolean;
  supportsLumpsum?: boolean;
  investUrl?: string | null;
  features?: string[];
  highlights?: string | null;
  displayPriority?: number;
  status?: string;
};
