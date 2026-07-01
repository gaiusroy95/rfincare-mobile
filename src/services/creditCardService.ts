import { apiClient } from '../api/apiClient';
import { buildCreditCardQueryParams } from '../utils/creditCardFilters';
import type { CreditCardFilters } from '../constants/creditCardMarketplace';

export const creditCardService = {
  async listActive(filters: Partial<CreditCardFilters> = {}) {
    const params = buildCreditCardQueryParams(filters);
    const res = await apiClient.get('/credit-cards', { params });
    return res.data;
  },

  async listAll(filters: Partial<CreditCardFilters> = {}) {
    const params = { includeInactive: 'true', ...buildCreditCardQueryParams(filters) };
    const res = await apiClient.get('/credit-cards', { params });
    return res.data;
  },

  async getTaxonomy() {
    const res = await apiClient.get('/credit-cards/taxonomy');
    return res.data;
  },

  async getById(id: string) {
    const res = await apiClient.get(`/credit-cards/${id}`);
    return res.data;
  },
};

export type CreditCard = {
  id: string;
  bankId?: string | null;
  bankName: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  cardNetwork?: string | null;
  categories?: string[];
  annualFee?: number | null;
  joiningFee?: number | null;
  interestRate?: number | null;
  latePaymentFee?: string | null;
  otherCharges?: string | null;
  features?: string[];
  advantages?: string[];
  benefits?: string[];
  rewardPoints?: string | null;
  hasRewardPoints?: boolean;
  loungeAccess?: boolean;
  loungeAccessDetails?: string | null;
  fuelSurchargeWaiver?: boolean;
  movieBenefits?: boolean;
  movieBenefitsDetails?: string | null;
  diningBenefits?: boolean;
  diningBenefitsDetails?: string | null;
  insuranceCover?: boolean;
  insuranceCoverDetails?: string | null;
  forexCharges?: string | null;
  emiConversion?: boolean;
  emiConversionDetails?: string | null;
  applyUrl?: string | null;
  displayPriority?: number;
  status?: string;
};
