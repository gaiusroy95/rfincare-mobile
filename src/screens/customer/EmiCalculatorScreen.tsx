import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Screen from '@/src/components/Screen';
import CustomerHeaderActions from '@/src/components/customer/CustomerHeaderActions';
import Input from '@/src/components/Input';
import Button from '@/src/components/Button';
import Card from '@/src/components/Card';
import { colors } from '@/src/theme';
// @ts-expect-error JS module
import { calculateEmi, formatInr } from '@/src/utils/emiCalculator';

export default function EmiCalculatorScreen() {
  const [amount, setAmount] = useState('500000');
  const [rate, setRate] = useState('10.5');
  const [tenure, setTenure] = useState('60');
  const [result, setResult] = useState<ReturnType<typeof calculateEmi>>(null);

  const calc = () => setResult(calculateEmi(Number(amount), Number(rate), Number(tenure)));

  return (
    <Screen title="EMI Calculator" showBack headerRight={<CustomerHeaderActions />}>
      <Input label="Loan Amount (₹)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <Input label="Annual Interest Rate (%)" value={rate} onChangeText={setRate} keyboardType="decimal-pad" />
      <Input label="Tenure (months)" value={tenure} onChangeText={setTenure} keyboardType="numeric" />
      <Button title="Calculate EMI" onPress={calc} variant="customer" />
      {result && (
        <Card>
          <Text style={styles.emi}>Monthly EMI: {formatInr(result.emi)}</Text>
          <Text>Total Interest: {formatInr(result.totalInterest)}</Text>
          <Text>Total Payment: {formatInr(result.totalPayment)}</Text>
        </Card>
      )}
      <Button title="Check Eligibility" variant="outline" onPress={() => router.push('/(customer)/eligibility')} style={{ marginTop: 12 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  emi: { fontSize: 20, fontWeight: '700', color: colors.primary, marginBottom: 8 },
});
