import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from '@/src/components/Card';
import Input from '@/src/components/Input';
import Button from '@/src/components/Button';
import { colors } from '@/src/theme';
import { mutualFundService } from '@/src/services/mutualFundService';
import { formatCurrency } from '@/src/utils/postOfficeFilters';

type CalcResult = {
  summary?: string;
  futureValue?: number;
  totalInvested?: number;
  returnsAmount?: number;
};

const DEFAULT_INPUTS = {
  investmentMode: 'sip' as 'sip' | 'lumpsum',
  monthlyInvestment: '5000',
  lumpsumAmount: '100000',
  expectedReturn: '12',
  expenseRatio: '0.5',
  tenureYears: '10',
};

export default function MutualFundCalculatorCard() {
  const [inputs, setInputs] = useState({ ...DEFAULT_INPUTS });
  const [result, setResult] = useState<CalcResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCalculate = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await mutualFundService.calculate({
        investmentMode: inputs.investmentMode,
        monthlyInvestment: inputs.monthlyInvestment !== '' ? Number(inputs.monthlyInvestment) : undefined,
        lumpsumAmount: inputs.lumpsumAmount !== '' ? Number(inputs.lumpsumAmount) : undefined,
        expectedReturn: inputs.expectedReturn !== '' ? Number(inputs.expectedReturn) : undefined,
        expenseRatio: inputs.expenseRatio !== '' ? Number(inputs.expenseRatio) : undefined,
        tenureYears: inputs.tenureYears !== '' ? Number(inputs.tenureYears) : undefined,
      });
      setResult(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error
        || (err as { message?: string })?.message
        || 'Calculation failed';
      setError(msg);
      setResult(null);
    }
    setLoading(false);
  };

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Mutual Fund Calculator</Text>
      <Text style={styles.sub}>Estimate SIP or lumpsum returns before you invest</Text>

      <View style={styles.modeRow}>
        {(['sip', 'lumpsum'] as const).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.modeBtn, inputs.investmentMode === mode && styles.modeBtnActive]}
            onPress={() => setInputs((prev) => ({ ...prev, investmentMode: mode }))}
          >
            <Text style={[styles.modeText, inputs.investmentMode === mode && styles.modeTextActive]}>
              {mode === 'sip' ? 'SIP' : 'Lumpsum'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {inputs.investmentMode === 'sip' ? (
        <Input label="Monthly SIP (₹)" value={inputs.monthlyInvestment} onChangeText={(v) => setInputs((p) => ({ ...p, monthlyInvestment: v }))} keyboardType="numeric" />
      ) : (
        <Input label="Lumpsum amount (₹)" value={inputs.lumpsumAmount} onChangeText={(v) => setInputs((p) => ({ ...p, lumpsumAmount: v }))} keyboardType="numeric" />
      )}
      <Input label="Expected return (% p.a.)" value={inputs.expectedReturn} onChangeText={(v) => setInputs((p) => ({ ...p, expectedReturn: v }))} keyboardType="numeric" />
      <Input label="Expense ratio (% p.a.)" value={inputs.expenseRatio} onChangeText={(v) => setInputs((p) => ({ ...p, expenseRatio: v }))} keyboardType="numeric" />
      <Input label="Tenure (years)" value={inputs.tenureYears} onChangeText={(v) => setInputs((p) => ({ ...p, tenureYears: v }))} keyboardType="numeric" />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Calculate returns" variant="customer" onPress={handleCalculate} loading={loading} style={{ marginTop: 8 }} />

      {result ? (
        <View style={styles.resultBox}>
          {result.summary ? <Text style={styles.summary}>{result.summary}</Text> : null}
          <View style={styles.metricsRow}>
            <View style={styles.metric}><Text style={styles.metricLabel}>Future value</Text><Text style={styles.metricValue}>{formatCurrency(result.futureValue)}</Text></View>
            <View style={styles.metric}><Text style={styles.metricLabel}>Invested</Text><Text style={styles.metricValue}>{formatCurrency(result.totalInvested)}</Text></View>
            <View style={styles.metric}><Text style={styles.metricLabel}>Gains</Text><Text style={[styles.metricValue, { color: '#059669' }]}>{formatCurrency(result.returnsAmount)}</Text></View>
          </View>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 14 },
  title: { fontSize: 17, fontWeight: '900', color: colors.foreground },
  sub: { fontSize: 12, color: colors.mutedForeground, marginTop: 4, marginBottom: 12 },
  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  modeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  modeBtnActive: { backgroundColor: colors.customer, borderColor: colors.customer },
  modeText: { fontWeight: '700', color: colors.mutedForeground },
  modeTextActive: { color: '#fff' },
  error: { color: '#DC2626', fontSize: 12, marginTop: 8 },
  resultBox: { marginTop: 12, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border },
  summary: { fontSize: 12, color: colors.mutedForeground, marginBottom: 10 },
  metricsRow: { flexDirection: 'row', gap: 8 },
  metric: { flex: 1, backgroundColor: colors.card, borderRadius: 10, padding: 8, borderWidth: 1, borderColor: colors.border },
  metricLabel: { fontSize: 10, color: colors.mutedForeground, fontWeight: '700' },
  metricValue: { fontSize: 12, fontWeight: '900', color: colors.foreground, marginTop: 4 },
});
