import { apiClient } from '../api/apiClient';
import { buildGovernmentSchemeQueryParams } from '../utils/governmentSchemeFilters';
import type { GovernmentSchemeFilters } from '../constants/governmentSchemeMarketplace';

export const governmentSchemeService = {
  async listActive(filters: Partial<GovernmentSchemeFilters> = {}) {
    const params = buildGovernmentSchemeQueryParams(filters);
    const res = await apiClient.get('/government-schemes', { params });
    return res.data;
  },
};

export type GovernmentScheme = {
  id: string;
  ministryName: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  categories?: string[];
  loanAmountMin?: number | null;
  loanAmountMax?: number | null;
  subsidyPercent?: number | null;
  interestRate?: number | null;
  eligibilityText?: string | null;
  benefitsText?: string | null;
  applicationUrl?: string | null;
  features?: string[];
  highlights?: string | null;
  displayPriority?: number;
  status?: string;
};
