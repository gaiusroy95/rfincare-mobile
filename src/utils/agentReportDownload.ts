import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { getAccessToken, loadStoredTokens } from '@/src/api/apiClient';
import { getApiBaseUrl, MOBILE_CLIENT_HEADER } from '@/src/api/runtimeConfig';
import type { CommissionReportFilters } from '@/src/services/agentReportService';

function buildReportUrl(filters: CommissionReportFilters, format: 'csv' | 'pdf'): string {
  const base = getApiBaseUrl().replace(/\/$/, '');
  const params = new URLSearchParams();
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.applicationStatus && filters.applicationStatus !== 'all') {
    params.set('applicationStatus', filters.applicationStatus);
  }
  if (filters.commissionStatus && filters.commissionStatus !== 'all') {
    params.set('commissionStatus', filters.commissionStatus);
  }
  if (filters.loanType && filters.loanType !== 'all') {
    params.set('loanType', filters.loanType);
  }
  params.set('format', format);
  return `${base}/portal/agent/reports/commission-report?${params.toString()}`;
}

export async function downloadCommissionReport(
  filters: CommissionReportFilters,
  format: 'csv' | 'pdf',
): Promise<void> {
  try {
    await loadStoredTokens();
    const token = getAccessToken();
    const url = buildReportUrl(filters, format);
    const filename = `commission-report-${Date.now()}.${format}`;
    const dest = `${FileSystem.cacheDirectory}${filename}`;
    const headers: Record<string, string> = { 'X-Rfincare-Client': MOBILE_CLIENT_HEADER };
    if (token) headers.Authorization = `Bearer ${token}`;

    const result = await FileSystem.downloadAsync(url, dest, { headers });
    if (result.status !== 200) {
      Alert.alert('Download failed', 'Could not download the report. Please sign in and try again.');
      return;
    }

    const mimeType = format === 'pdf' ? 'application/pdf' : 'text/csv';
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(result.uri, {
        mimeType,
        UTI: format === 'pdf' ? 'com.adobe.pdf' : 'public.comma-separated-values-text',
      });
    } else {
      Alert.alert('Saved', `Report saved to ${result.uri}`);
    }
  } catch (e) {
    Alert.alert('Error', (e as Error).message || 'Download failed');
  }
}
