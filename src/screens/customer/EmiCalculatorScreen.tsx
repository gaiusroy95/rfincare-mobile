import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Screen from '@/src/components/Screen';
import CustomerHeaderActions from '@/src/components/customer/CustomerHeaderActions';
import Input from '@/src/components/Input';
import Button from '@/src/components/Button';
import Card from '@/src/components/Card';
import { colors } from '@/src/theme';
// @ts-expect-error JS module
import { buildRepaymentSchedule, calculateEmi, formatInr } from '@/src/utils/emiCalculator';

type EmiResult = NonNullable<ReturnType<typeof calculateEmi>>;

function PaymentAnalytics({ result }: { result: EmiResult }) {
  const principalPct = result.totalPayment > 0 ? (result.principal / result.totalPayment) * 100 : 100;
  const interestPct = result.totalPayment > 0 ? (result.totalInterest / result.totalPayment) * 100 : 0;

  return (
    <Card style={styles.analyticsCard}>
      <Text style={styles.sectionTitle}>Payment breakdown</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barPrincipal, { flex: principalPct || 0.001 }]} />
        <View style={[styles.barInterest, { flex: interestPct || 0.001 }]} />
      </View>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.customer }]} />
          <View style={styles.legendText}>
            <Text style={styles.legendLabel}>Principal</Text>
            <Text style={styles.legendValue}>{formatInr(result.principal)}</Text>
            <Text style={styles.legendPct}>{principalPct.toFixed(1)}% of total</Text>
          </View>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <View style={styles.legendText}>
            <Text style={styles.legendLabel}>Total interest</Text>
            <Text style={styles.legendValue}>{formatInr(result.totalInterest)}</Text>
            <Text style={styles.legendPct}>{interestPct.toFixed(1)}% of total</Text>
          </View>
        </View>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total payment</Text>
        <Text style={styles.totalValue}>{formatInr(result.totalPayment)}</Text>
      </View>
    </Card>
  );
}

function RepaymentSchedule({
  schedule,
  expanded,
  onToggle,
}: {
  schedule: ReturnType<typeof buildRepaymentSchedule>;
  expanded: boolean;
  onToggle: () => void;
}) {
  const visible = expanded ? schedule : schedule.slice(0, 12);

  return (
    <Card style={styles.scheduleCard}>
      <Text style={styles.sectionTitle}>Loan repayment schedule</Text>
      <Text style={styles.scheduleHint}>Month-wise principal, interest, and outstanding balance</Text>

      <View style={styles.tableHeader}>
        <Text style={[styles.th, styles.colMonth]}>Month</Text>
        <Text style={[styles.th, styles.colNum]}>EMI</Text>
        <Text style={[styles.th, styles.colNum]}>Principal</Text>
        <Text style={[styles.th, styles.colNum]}>Interest</Text>
        <Text style={[styles.th, styles.colBalance]}>Balance</Text>
      </View>

      {visible.map((row) => (
        <View key={row.month} style={styles.tableRow}>
          <Text style={[styles.td, styles.colMonth]}>{row.month}</Text>
          <Text style={[styles.td, styles.colNum]}>{formatInr(row.emi)}</Text>
          <Text style={[styles.td, styles.colNum]}>{formatInr(row.principal)}</Text>
          <Text style={[styles.td, styles.colNum]}>{formatInr(row.interest)}</Text>
          <Text style={[styles.td, styles.colBalance]}>{formatInr(row.balance)}</Text>
        </View>
      ))}

      {schedule.length > 12 ? (
        <TouchableOpacity onPress={onToggle} style={styles.toggleBtn} activeOpacity={0.8}>
          <Text style={styles.toggleText}>
            {expanded ? 'Show fewer months' : `Show all ${schedule.length} months`}
          </Text>
        </TouchableOpacity>
      ) : null}
    </Card>
  );
}

export default function EmiCalculatorScreen() {
  const [amount, setAmount] = useState('500000');
  const [rate, setRate] = useState('10.5');
  const [tenure, setTenure] = useState('60');
  const [result, setResult] = useState<EmiResult | null>(null);
  const [scheduleExpanded, setScheduleExpanded] = useState(false);

  const schedule = useMemo(() => {
    if (!result) return [];
    return buildRepaymentSchedule(result.principal, result.annualRatePercent, result.tenureMonths);
  }, [result]);

  const calc = () => {
    const next = calculateEmi(Number(amount), Number(rate), Number(tenure));
    setResult(next);
    setScheduleExpanded(false);
  };

  return (
    <Screen title="EMI Calculator" showBack headerRight={<CustomerHeaderActions />}>
      <Input label="Loan Amount (₹)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <Input label="Annual Interest Rate (%)" value={rate} onChangeText={setRate} keyboardType="decimal-pad" />
      <Input label="Tenure (months)" value={tenure} onChangeText={setTenure} keyboardType="numeric" />
      <Button title="Calculate EMI" onPress={calc} variant="customer" />

      {result ? (
        <>
          <Card style={styles.summaryCard}>
            <Text style={styles.emi}>Monthly EMI: {formatInr(result.emi)}</Text>
            <Text style={styles.summaryLine}>Total Interest: {formatInr(result.totalInterest)}</Text>
            <Text style={styles.summaryLine}>Total Payment: {formatInr(result.totalPayment)}</Text>
          </Card>

          <PaymentAnalytics result={result} />
          <RepaymentSchedule
            schedule={schedule}
            expanded={scheduleExpanded}
            onToggle={() => setScheduleExpanded((v) => !v)}
          />
        </>
      ) : null}

      <Button
        title="Check Eligibility"
        variant="outline"
        onPress={() => router.push('/(customer)/eligibility')}
        style={{ marginTop: 12 }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryCard: { marginTop: 16 },
  emi: { fontSize: 20, fontWeight: '700', color: colors.primary, marginBottom: 8 },
  summaryLine: { fontSize: 14, color: colors.foreground, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 8 },
  analyticsCard: { marginTop: 12 },
  barTrack: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: colors.muted,
    marginBottom: 16,
  },
  barPrincipal: { backgroundColor: colors.customer },
  barInterest: { backgroundColor: '#F59E0B' },
  legendRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  legendItem: { flex: 1, flexDirection: 'row', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  legendText: { flex: 1 },
  legendLabel: { fontSize: 12, fontWeight: '600', color: colors.foreground },
  legendValue: { fontSize: 14, fontWeight: '700', color: colors.foreground, marginTop: 2 },
  legendPct: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: { fontSize: 14, fontWeight: '600', color: colors.foreground },
  totalValue: { fontSize: 16, fontWeight: '800', color: colors.customer },
  scheduleCard: { marginTop: 12, marginBottom: 8 },
  scheduleHint: { fontSize: 12, color: colors.mutedForeground, marginBottom: 12, lineHeight: 17 },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.muted,
    borderRadius: 8,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 6,
  },
  th: { fontSize: 10, fontWeight: '700', color: colors.mutedForeground, textTransform: 'uppercase' },
  td: { fontSize: 11, color: colors.foreground },
  colMonth: { width: 44 },
  colNum: { flex: 1, textAlign: 'right' },
  colBalance: { flex: 1.1, textAlign: 'right' },
  toggleBtn: { paddingVertical: 12, alignItems: 'center' },
  toggleText: { fontSize: 14, fontWeight: '600', color: colors.customer },
});
