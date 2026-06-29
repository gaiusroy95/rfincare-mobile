import { apiClient } from '../api/apiClient';

export const creditCardService = {
  async listActive() {
    const res = await apiClient.get('/credit-cards');
    return res.data;
  },

  async listAll() {
    const res = await apiClient.get('/credit-cards', { params: { includeInactive: 'true' } });
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
  annualFee?: number | null;
  joiningFee?: number | null;
  interestRate?: number | null;
  latePaymentFee?: string | null;
  otherCharges?: string | null;
  features?: string[];
  advantages?: string[];
  benefits?: string[];
  applyUrl?: string | null;
  displayPriority?: number;
  status?: string;
};
