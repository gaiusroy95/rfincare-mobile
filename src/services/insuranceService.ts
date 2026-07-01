import { apiClient } from '../api/apiClient';
import { buildInsuranceQueryParams } from '../utils/insuranceFilters';
import type { InsuranceFilters } from '../constants/insuranceMarketplace';

export const insuranceService = {
  async listActive(filters: Partial<InsuranceFilters> = {}) {
    const params = buildInsuranceQueryParams(filters);
    const res = await apiClient.get('/insurance-products', { params });
    return res.data;
  },

  async listAll(filters: Partial<InsuranceFilters> = {}) {
    const params = { includeInactive: 'true', ...buildInsuranceQueryParams(filters) };
    const res = await apiClient.get('/insurance-products', { params });
    return res.data;
  },

  async getTaxonomy() {
    const res = await apiClient.get('/insurance-products/taxonomy');
    return res.data;
  },

  async getById(id: string) {
    const res = await apiClient.get(`/insurance-products/${id}`);
    return res.data;
  },
};

export type InsuranceProduct = {
  id: string;
  insurerId?: string | null;
  insurerName: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  segment: string;
  categories?: string[];
  premiumFrom?: number | null;
  premiumTo?: number | null;
  premiumUnit?: string;
  sumInsuredFrom?: number | null;
  sumInsuredTo?: number | null;
  coverageTermYears?: number | null;
  waitingPeriodDays?: number | null;
  claimSettlementRatio?: number | null;
  cashlessHospitals?: number | null;
  taxBenefit80c?: boolean;
  taxBenefit80d?: boolean;
  supportsNewPolicy?: boolean;
  supportsRenewal?: boolean;
  supportsClaimAssistance?: boolean;
  newPolicyUrl?: string | null;
  renewalUrl?: string | null;
  claimAssistanceUrl?: string | null;
  features?: string[];
  benefits?: string[];
  highlights?: string | null;
  displayPriority?: number;
  status?: string;
};
