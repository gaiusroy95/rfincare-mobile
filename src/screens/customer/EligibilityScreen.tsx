import React, { useState } from 'react';

import { Text, StyleSheet, Alert } from 'react-native';

import { router } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import Screen from '@/src/components/Screen';

import CustomerHeaderActions from '@/src/components/customer/CustomerHeaderActions';

import Button from '@/src/components/Button';

import Input from '@/src/components/Input';

import Card from '@/src/components/Card';

import Select from '@/src/components/Select';

import { colors } from '@/src/theme';

// @ts-expect-error JS module

import { leadService, saveEligibilityResults, ELIGIBILITY_SESSION_KEY } from '@/src/services/leadService';

// @ts-expect-error JS module

import { homepageService } from '@/src/services/homepageService';

// @ts-expect-error JS module

import { CREDIT_SCORE_RANGE_OPTIONS } from '@/src/constants/creditScoreRanges';

import { useLoanProducts } from '@/src/contexts/LoanProductsContext';



export default function EligibilityScreen() {

  const { products } = useLoanProducts();

  const productOptions = (products as { apiKey?: string; label?: string }[])

    .filter((p) => p.apiKey)

    .map((p) => ({ value: p.apiKey!, label: p.label || p.apiKey! }));



  const [phase, setPhase] = useState<'gate' | 'form' | 'result'>('gate');

  const [mobile, setMobile] = useState('');

  const [email, setEmail] = useState('');

  const [otp, setOtp] = useState('');

  const [leadId, setLeadId] = useState('');

  const [loanType, setLoanType] = useState(productOptions[0]?.value || 'personal_loan');

  const [amount, setAmount] = useState('');

  const [income, setIncome] = useState('');

  const [employment, setEmployment] = useState('salaried');

  const [creditScoreRange, setCreditScoreRange] = useState('700_749');

  const [result, setResult] = useState<Record<string, unknown> | null>(null);



  const requestOtp = async () => {

    try {

      const res = await leadService.startVerification({ mobile, email, phone: mobile });

      setLeadId(res?.leadId || res?.id || '');

      Alert.alert('OTP sent', 'Check your phone/email');

    } catch (e: unknown) {

      Alert.alert('Error', (e as Error).message);

    }

  };



  const verifyOtp = async () => {

    try {

      const res = await leadService.verifyOtp({ phone: mobile, email, mobileOtp: otp, leadId });

      setLeadId(res?.leadId || leadId);

      setPhase('form');

    } catch (e: unknown) {

      Alert.alert('Error', (e as Error).message);

    }

  };



  const calculate = async () => {

    try {

      const formData = {

        loanType,

        loanAmount: Number(amount),

        monthlyIncome: Number(income) / 12,

        employmentType: employment,

        creditScoreRange,

      };

      const res = await homepageService.calculateEligibility({

        loanType,

        loanAmount: Number(amount),

        monthlyIncome: Number(income) / 12,

        employmentType: employment,

        creditScore: Number(creditScoreRange.split('_')[0]) || 700,

      });

      setResult(res);

      saveEligibilityResults(res, formData);

      await AsyncStorage.setItem(ELIGIBILITY_SESSION_KEY, JSON.stringify({ result: res, formData }));

      if (leadId) await leadService.updateLead(leadId, { eligibilityResult: res, ...formData });

      setPhase('result');

    } catch (e: unknown) {

      Alert.alert('Error', (e as Error).message);

    }

  };



  if (phase === 'gate') {

    return (

      <Screen title="Eligibility — Verify" showBack headerRight={<CustomerHeaderActions />}>

        <Text style={styles.desc}>Verify your contact to check loan eligibility.</Text>

        <Input label="Mobile (10 digits)" value={mobile} onChangeText={(v) => setMobile(v.replace(/\D/g, '').slice(0, 10))} keyboardType="phone-pad" maxLength={10} />

        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <Button title="Send OTP" onPress={requestOtp} variant="customer" />

        <Input label="OTP" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} />

        <Button title="Verify & Continue" onPress={verifyOtp} style={{ marginTop: 8 }} />

      </Screen>

    );

  }



  if (phase === 'form') {

    return (

      <Screen title="Eligibility Check" showBack headerRight={<CustomerHeaderActions />}>

        <Select label="Loan Type" value={loanType} options={productOptions.length ? productOptions : [{ value: 'personal_loan', label: 'Personal Loan' }]} onChange={setLoanType} />

        <Input label="Loan Amount (₹)" value={amount} onChangeText={setAmount} keyboardType="numeric" />

        <Input label="Annual Income (₹)" value={income} onChangeText={setIncome} keyboardType="numeric" />

        <Select label="Employment" value={employment} options={[

          { value: 'salaried', label: 'Salaried' },

          { value: 'self_employed', label: 'Self-employed' },

          { value: 'business', label: 'Business' },

        ]} onChange={setEmployment} />

        <Select label="Credit Score Range" value={creditScoreRange} options={CREDIT_SCORE_RANGE_OPTIONS} onChange={setCreditScoreRange} />

        <Button title="Calculate Eligibility" onPress={calculate} variant="customer" />

      </Screen>

    );

  }



  return (

    <Screen title="Eligibility Results" showBack headerRight={<CustomerHeaderActions />}>

      <Card>

        <Text style={styles.score}>Score: {String(result?.score ?? result?.eligibilityScore ?? '—')}</Text>

        <Text>Eligible Amount: ₹{String(result?.eligibleAmount ?? '—')}</Text>

        <Text style={styles.msg}>{String(result?.message ?? '')}</Text>

      </Card>

      <Button title="Start Application" onPress={() => router.push({ pathname: '/(customer)/assessment', params: { loanType } })} variant="customer" />

      <Button title="Compare Banks" variant="outline" onPress={() => router.push('/(customer)/(tabs)/marketplace')} style={{ marginTop: 8 }} />

    </Screen>

  );

}



const styles = StyleSheet.create({

  desc: { color: colors.mutedForeground, marginBottom: 16 },

  score: { fontSize: 20, fontWeight: '700', color: colors.primary, marginBottom: 8 },

  msg: { marginTop: 8, color: colors.mutedForeground },

});


