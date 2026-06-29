import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Card from '@/src/components/Card';
import { colors } from '@/src/theme';
import type { EligibilityResult } from '@/src/utils/assessmentEligibility';

type Props = {
  result: EligibilityResult | null;
  compact?: boolean;
};

const STATUS_LABELS: Record<string, string> = {
  likely_approved: 'Likely approved',
  conditional: 'Conditional approval',
  unlikely: 'Unlikely with current parameters',
};

function formatInr(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '—';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export default function EligibilityResultSummary({ result, compact }: Props) {
  if (!result) return null;

  const score = Number(result.overallProbability);
  const scoreLabel = Number.isFinite(score) ? `${Math.round(score)}%` : '—';
  const statusLabel = STATUS_LABELS[String(result.status ?? '')] || '';
  const topBanks = (result.banks || [])
    .filter((b) => b?.bankName)
    .slice(0, 3);

  return (
    <Card style={compact ? styles.compactCard : undefined}>
      <Text style={styles.heading}>Expected eligibility</Text>
      <Text style={styles.score}>Approval score: {scoreLabel}</Text>
      {statusLabel ? <Text style={styles.status}>{statusLabel}</Text> : null}
      <View style={styles.row}>
        <Text style={styles.label}>Eligible amount</Text>
        <Text style={styles.value}>{formatInr(result.eligibleAmount)}</Text>
      </View>
      {result.maxMonthlyEmi ? (
        <View style={styles.row}>
          <Text style={styles.label}>Max monthly EMI</Text>
          <Text style={styles.value}>{formatInr(result.maxMonthlyEmi)}</Text>
        </View>
      ) : null}
      {result.message ? <Text style={styles.message}>{result.message}</Text> : null}
      {!compact && topBanks.length > 0 ? (
        <View style={styles.banks}>
          <Text style={styles.banksTitle}>Top matching banks</Text>
          {topBanks.map((bank) => (
            <View key={bank.bankName} style={styles.bankRow}>
              <Text style={styles.bankName}>{bank.bankName}</Text>
              <Text style={styles.bankScore}>
                {Number.isFinite(Number(bank.bestProbability))
                  ? `${Math.round(Number(bank.bestProbability))}%`
                  : '—'}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      <Text style={styles.disclaimer}>
        Indicative estimate based on your application. Final approval depends on document verification and lender policies.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  compactCard: { marginBottom: 12 },
  heading: { fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 8 },
  score: { fontSize: 20, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  status: { fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 14, color: colors.mutedForeground },
  value: { fontSize: 14, fontWeight: '600', color: colors.foreground },
  message: { fontSize: 13, color: colors.mutedForeground, marginTop: 8, lineHeight: 19 },
  banks: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  banksTitle: { fontSize: 13, fontWeight: '600', color: colors.foreground, marginBottom: 8 },
  bankRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  bankName: { fontSize: 13, color: colors.foreground, flex: 1, marginRight: 8 },
  bankScore: { fontSize: 13, fontWeight: '600', color: colors.primary },
  disclaimer: { fontSize: 11, color: colors.mutedForeground, marginTop: 12, lineHeight: 16 },
});
