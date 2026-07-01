import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/src/components/Card';
import Button from '@/src/components/Button';
import Input from '@/src/components/Input';
import Select from '@/src/components/Select';
import DateField from '@/src/components/DateField';
import { colors } from '@/src/theme';
import {
  agentReportService,
  type CommissionReportFilters,
  type CommissionReportPreview,
} from '@/src/services/agentReportService';
import { downloadCommissionReport } from '@/src/utils/agentReportDownload';

const APP_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'disbursed', label: 'Disbursed' },
  { value: 'rejected', label: 'Rejected' },
];

const COMM_STATUS_OPTIONS = [
  { value: 'all', label: 'All commission statuses' },
  { value: 'ineligible', label: 'Ineligible' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_process', label: 'In process' },
  { value: 'paid', label: 'Paid' },
];

const REPORT_FORMATS = [
  { value: 'csv', label: 'CSV', hint: 'Spreadsheet / reconciliation' },
  { value: 'pdf', label: 'PDF', hint: 'Shareable summary' },
] as const;

export default function CommissionReportPanel() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [applicationStatus, setApplicationStatus] = useState('all');
  const [commissionStatus, setCommissionStatus] = useState('all');
  const [loanType, setLoanType] = useState('all');
  const [preview, setPreview] = useState<CommissionReportPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<'csv' | 'pdf' | null>(null);

  const filters: CommissionReportFilters = {
    from: from || undefined,
    to: to || undefined,
    applicationStatus,
    commissionStatus,
    loanType,
  };

  const loadPreview = async () => {
    setLoading(true);
    try {
      const data = await agentReportService.getCommissionReportPreview(filters);
      setPreview(data);
    } catch (e) {
      setPreview({ entries: [] });
    }
    setLoading(false);
  };

  const download = async (format: 'csv' | 'pdf') => {
    setDownloading(format);
    try {
      await downloadCommissionReport(filters, format);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="document-text" size={20} color={colors.agent} />
        <Text style={styles.title}>Reports & Downloads</Text>
      </View>
      <Text style={styles.subtitle}>
        Commission report with date, status, and loan-type filters. Export CSV for reconciliation or PDF
        for sharing.
      </Text>

      <Text style={styles.filterHeading}>Filters</Text>
      <DateField label="From date" value={from} onChange={setFrom} maximumDate={to ? new Date(to) : new Date()} />
      <DateField label="To date" value={to} onChange={setTo} minimumDate={from ? new Date(from) : undefined} maximumDate={new Date()} />
      <Select
        label="Application status"
        value={applicationStatus}
        options={APP_STATUS_OPTIONS}
        onChange={setApplicationStatus}
      />
      <Select
        label="Commission status"
        value={commissionStatus}
        options={COMM_STATUS_OPTIONS}
        onChange={setCommissionStatus}
      />
      <Input
        label="Loan type (optional)"
        placeholder="e.g. personal_loan"
        value={loanType === 'all' ? '' : loanType}
        onChangeText={(v) => setLoanType(v || 'all')}
      />

      <Button title="Preview report" variant="outline" onPress={loadPreview} loading={loading} style={styles.btn} />

      <Text style={styles.filterHeading}>Download format</Text>
      <View style={styles.formatRow}>
        {REPORT_FORMATS.map((f) => (
          <View key={f.value} style={styles.formatCard}>
            <Text style={styles.formatLabel}>{f.label}</Text>
            <Text style={styles.formatHint}>{f.hint}</Text>
            <Button
              title={`Download ${f.label}`}
              variant={f.value === 'pdf' ? 'outline' : 'agent'}
              onPress={() => download(f.value)}
              loading={downloading === f.value}
              style={styles.formatBtn}
            />
          </View>
        ))}
      </View>

      {preview && preview.entries?.length > 0 ? (
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>Preview (up to 20 rows)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              <View style={styles.tableHeader}>
                <Text style={[styles.cell, styles.cellWide]}>App #</Text>
                <Text style={[styles.cell, styles.cellWide]}>Customer</Text>
                <Text style={styles.cell}>Status</Text>
                <Text style={[styles.cell, styles.cellNum]}>Disbursed</Text>
                <Text style={[styles.cell, styles.cellNum]}>Gross</Text>
                <Text style={[styles.cell, styles.cellNum]}>TDS</Text>
                <Text style={[styles.cell, styles.cellNum]}>Net</Text>
              </View>
              {preview.entries.slice(0, 20).map((row) => (
                <View key={row.applicationNumber} style={styles.tableRow}>
                  <Text style={[styles.cell, styles.cellWide]} numberOfLines={1}>{row.applicationNumber}</Text>
                  <Text style={[styles.cell, styles.cellWide]} numberOfLines={1}>{row.customerName}</Text>
                  <Text style={styles.cell}>{row.commissionStatus}</Text>
                  <Text style={[styles.cell, styles.cellNum]}>{row.disbursedAmount}</Text>
                  <Text style={[styles.cell, styles.cellNum]}>{row.grossCommission}</Text>
                  <Text style={[styles.cell, styles.cellNum]}>{row.tdsAmount}</Text>
                  <Text style={[styles.cell, styles.cellNum]}>{row.netPayout}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
          {preview.generatedAt ? (
            <Text style={styles.generated}>Generated {preview.generatedAt}</Text>
          ) : null}
        </View>
      ) : preview && !loading ? (
        <Text style={styles.noRows}>No rows match the selected filters.</Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  title: { fontSize: 16, fontWeight: '700', color: colors.foreground },
  subtitle: { fontSize: 12, color: colors.mutedForeground, lineHeight: 18, marginBottom: 12 },
  filterHeading: { fontWeight: '700', fontSize: 13, color: colors.foreground, marginTop: 4, marginBottom: 8 },
  btn: { marginTop: 4, marginBottom: 8 },
  formatRow: { gap: 10 },
  formatCard: {
    backgroundColor: colors.muted,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formatLabel: { fontWeight: '700', fontSize: 14, color: colors.foreground },
  formatHint: { fontSize: 11, color: colors.mutedForeground, marginTop: 2, marginBottom: 8 },
  formatBtn: { alignSelf: 'flex-start' },
  preview: { marginTop: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  previewTitle: { fontWeight: '700', marginBottom: 8, fontSize: 13 },
  tableHeader: { flexDirection: 'row', backgroundColor: colors.muted, paddingVertical: 8 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 8 },
  cell: { width: 72, fontSize: 11, color: colors.foreground, paddingHorizontal: 4 },
  cellWide: { width: 100 },
  cellNum: { width: 64, textAlign: 'right' },
  generated: { fontSize: 10, color: colors.mutedForeground, marginTop: 8 },
  noRows: { fontSize: 12, color: colors.mutedForeground, marginTop: 12, textAlign: 'center' },
});
