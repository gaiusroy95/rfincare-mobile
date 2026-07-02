import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Input from '@/src/components/Input';
import Button from '@/src/components/Button';
import Select from '@/src/components/Select';
import { colors } from '@/src/theme';
import { investmentProductService, type InvestmentProduct } from '@/src/services/investmentProductService';
import { INVESTMENT_CATEGORIES } from '@/src/constants/investmentMarketplace';
import { formatCurrency } from '@/src/utils/postOfficeFilters';

type CalcResult = {
  summary?: string;
  maturityValue?: number;
  totalInvested?: number;
  returnsAmount?: number;
  monthlyIncome?: number | null;
};

const DEFAULT_INPUTS = {
  calculatorType: 'sovereign_gold_bonds',
  investmentAmount: '100000',
  annualReturn: '8',
  couponRate: '7',
  tenureYears: '5',
  tenureMonths: '12',
};

function getDefaultInputs(product?: InvestmentProduct | null) {
  if (!product) return { ...DEFAULT_INPUTS };
  const type = product.categories?.[0] || 'sovereign_gold_bonds';
  return {
    calculatorType: type,
    investmentAmount: product.minInvestmentAmount != null ? String(product.minInvestmentAmount) : '100000',
    annualReturn: product.returns3y != null ? String(product.returns3y) : product.returns1y != null ? String(product.returns1y) : '8',
    couponRate: product.returns3y != null ? String(product.returns3y) : '7',
    tenureYears: '5',
    tenureMonths: '12',
  };
}

type Props = {
  visible: boolean;
  onClose: () => void;
  product?: InvestmentProduct | null;
};

export default function InvestmentCalculatorModal({ visible, onClose, product }: Props) {
  const [inputs, setInputs] = useState(() => getDefaultInputs(product));
  const [result, setResult] = useState<CalcResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const type = inputs.calculatorType;
  const isBond = ['bonds', 'corporate_bonds', 'rbi_floating_bonds', 'government_securities'].includes(type);
  const isTbill = type === 'treasury_bills';
  const isIncome = ['reit', 'invit'].includes(type);

  const typeOptions = INVESTMENT_CATEGORIES.map((c) => ({ value: c.slug, label: c.label }));

  useEffect(() => {
    if (!visible) return;
    setInputs(getDefaultInputs(product));
    setResult(null);
    setError('');
  }, [visible, product]);

  const handleCalculate = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await investmentProductService.calculate({
        calculatorType: inputs.calculatorType,
        investmentAmount: inputs.investmentAmount !== '' ? Number(inputs.investmentAmount) : undefined,
        annualReturn: inputs.annualReturn !== '' ? Number(inputs.annualReturn) : undefined,
        couponRate: inputs.couponRate !== '' ? Number(inputs.couponRate) : undefined,
        tenureYears: !isTbill && inputs.tenureYears !== '' ? Number(inputs.tenureYears) : undefined,
        tenureMonths: isTbill && inputs.tenureMonths !== '' ? Number(inputs.tenureMonths) : undefined,
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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Investment Calculator</Text>
              <Text style={styles.sub}>
                {product?.name ? `Estimate returns for ${product.name}` : 'Estimate maturity value and returns'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={colors.foreground} /></TouchableOpacity>
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            <Select label="Investment type" value={inputs.calculatorType} options={typeOptions} onChange={(v) => setInputs((p) => ({ ...p, calculatorType: v }))} />
            <Input label="Investment amount (₹)" value={inputs.investmentAmount} onChangeText={(v) => setInputs((p) => ({ ...p, investmentAmount: v }))} keyboardType="numeric" />
            <Input
              label={isIncome ? 'Distribution yield (% p.a.)' : 'Expected return (% p.a.)'}
              value={inputs.annualReturn}
              onChangeText={(v) => setInputs((p) => ({ ...p, annualReturn: v }))}
              keyboardType="numeric"
            />
            {isBond ? (
              <Input label="Coupon rate (% p.a.)" value={inputs.couponRate} onChangeText={(v) => setInputs((p) => ({ ...p, couponRate: v }))} keyboardType="numeric" />
            ) : null}
            {isTbill ? (
              <Input label="Tenure (months)" value={inputs.tenureMonths} onChangeText={(v) => setInputs((p) => ({ ...p, tenureMonths: v }))} keyboardType="numeric" />
            ) : (
              <Input label="Tenure (years)" value={inputs.tenureYears} onChangeText={(v) => setInputs((p) => ({ ...p, tenureYears: v }))} keyboardType="numeric" />
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {result ? (
              <View style={styles.resultBox}>
                {result.summary ? <Text style={styles.summary}>{result.summary}</Text> : null}
                <View style={styles.metricsRow}>
                  <View style={styles.metric}><Text style={styles.metricLabel}>Maturity</Text><Text style={styles.metricValue}>{formatCurrency(result.maturityValue)}</Text></View>
                  <View style={styles.metric}><Text style={styles.metricLabel}>Invested</Text><Text style={styles.metricValue}>{formatCurrency(result.totalInvested)}</Text></View>
                  <View style={styles.metric}><Text style={styles.metricLabel}>Gains</Text><Text style={[styles.metricValue, { color: '#059669' }]}>{formatCurrency(result.returnsAmount)}</Text></View>
                </View>
                {result.monthlyIncome != null ? (
                  <Text style={styles.income}>Monthly income: {formatCurrency(result.monthlyIncome)}</Text>
                ) : null}
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <Button title="Close" variant="ghost" onPress={onClose} />
            <Button title="Calculate" variant="customer" onPress={handleCalculate} loading={loading} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: '90%' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 17, fontWeight: '900', color: colors.foreground },
  sub: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  body: { padding: 16, maxHeight: 420 },
  footer: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  error: { color: '#DC2626', fontSize: 12, marginTop: 8 },
  resultBox: { marginTop: 12, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border },
  summary: { fontSize: 12, color: colors.mutedForeground, marginBottom: 10 },
  metricsRow: { flexDirection: 'row', gap: 8 },
  metric: { flex: 1, backgroundColor: colors.card, borderRadius: 10, padding: 8, borderWidth: 1, borderColor: colors.border },
  metricLabel: { fontSize: 10, color: colors.mutedForeground, fontWeight: '700' },
  metricValue: { fontSize: 12, fontWeight: '900', color: colors.foreground, marginTop: 4 },
  income: { fontSize: 12, fontWeight: '700', color: colors.foreground, marginTop: 10 },
});
