import { apiClient } from '@/src/api/apiClient';

export type CommissionReportFilters = {
  from?: string;
  to?: string;
  applicationStatus?: string;
  commissionStatus?: string;
  loanType?: string;
};

export type CommissionReportEntry = {
  applicationNumber: string;
  customerName: string;
  commissionStatus: string;
  disbursedAmount: number | string;
  grossCommission: number | string;
  tdsAmount: number | string;
  netPayout: number | string;
};

export type CommissionReportPreview = {
  entries: CommissionReportEntry[];
  generatedAt?: string;
  summary?: Record<string, unknown>;
};

export type PerformanceBucket = {
  name: string;
  clients: number;
  conversions: number;
  earnings: number;
};

export type PerformanceAnalytics = {
  week?: PerformanceBucket[];
  month?: PerformanceBucket[];
  quarter?: PerformanceBucket[];
  year?: PerformanceBucket[];
};

export const agentReportService = {
  async getCommissionReportPreview(filters: CommissionReportFilters): Promise<CommissionReportPreview> {
    const res = await apiClient.get('/portal/agent/reports/commission-report', { params: filters });
    return res.data;
  },
};
