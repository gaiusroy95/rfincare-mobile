import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/src/theme';

type AppRecord = Record<string, unknown>;

type StageInfo = {
  percent: number;
  currentLabel: string;
  isActive: boolean;
};

/** Map an application status to a progress percentage + stage label. */
export function resolveStage(status: string): StageInfo {
  switch (status) {
    case 'draft':
      return { percent: 12, currentLabel: 'Draft', isActive: true };
    case 'submitted':
      return { percent: 35, currentLabel: 'Submitted', isActive: true };
    case 'documents_pending':
      return { percent: 50, currentLabel: 'Document Verification', isActive: true };
    case 'questionnaire_pending':
      return { percent: 45, currentLabel: 'Questionnaire', isActive: true };
    case 'bank_selection_pending':
      return { percent: 65, currentLabel: 'Bank Selection', isActive: true };
    case 'under_review':
      return { percent: 78, currentLabel: 'Under Review', isActive: true };
    case 'approved':
      return { percent: 100, currentLabel: 'Approved', isActive: false };
    case 'rejected':
      return { percent: 100, currentLabel: 'Rejected', isActive: false };
    default:
      return { percent: 25, currentLabel: 'In Progress', isActive: true };
  }
}

type Props = {
  application: AppRecord;
  onUploadDocs: () => void;
  onDetails: () => void;
};

export default function ApplicationStatusCard({ application, onUploadDocs, onDetails }: Props) {
  const status = String(application.status || 'pending');
  const stage = resolveStage(status);
  const productName = String(
    application.loanType
      || application.loan_type
      || application.productName
      || 'Loan Application',
  );
  const appId = String(application.applicationNumber || application.application_number || application.id || '');
  const barColor = status === 'rejected' ? colors.destructive : colors.primary;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Application Status</Text>
        <View style={[styles.badge, !stage.isActive && styles.badgeDone]}>
          <Text style={[styles.badgeText, !stage.isActive && styles.badgeTextDone]}>
            {stage.isActive ? 'Active' : stage.currentLabel}
          </Text>
        </View>
      </View>

      <Text style={styles.product}>{formatProductName(productName)}</Text>
      {appId ? <Text style={styles.appId}>App ID: #{appId}</Text> : null}

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${stage.percent}%`, backgroundColor: barColor }]} />
      </View>
      <View style={styles.stageRow}>
        <Text style={styles.stageLabel}>{stage.currentLabel}</Text>
        <Text style={styles.stageLabelMuted}>Approval</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={onUploadDocs} activeOpacity={0.85}>
          <Text style={styles.primaryText}>Upload Docs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlineBtn} onPress={onDetails} activeOpacity={0.85}>
          <Text style={styles.outlineText}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function formatProductName(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 12,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '700', color: colors.foreground },
  badge: { backgroundColor: `${colors.customer}1A`, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeDone: { backgroundColor: `${colors.success}1A` },
  badgeText: { fontSize: 12, fontWeight: '700', color: colors.customer },
  badgeTextDone: { color: colors.success },
  product: { fontSize: 16, fontWeight: '600', color: colors.foreground },
  appId: { fontSize: 12, color: colors.mutedForeground, marginTop: 2, marginBottom: 14 },
  track: { height: 8, backgroundColor: colors.muted, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  stageRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, marginBottom: 16 },
  stageLabel: { fontSize: 11, fontWeight: '600', color: colors.foreground },
  stageLabelMuted: { fontSize: 11, color: colors.mutedForeground },
  actions: { flexDirection: 'row', gap: 10 },
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  outlineText: { color: colors.foreground, fontWeight: '700', fontSize: 14 },
});
