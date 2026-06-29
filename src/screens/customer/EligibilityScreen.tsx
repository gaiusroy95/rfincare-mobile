import React, { useEffect, useState } from 'react';

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
import { useMarketing } from '@/src/contexts/MarketingContext';

const RESEND_COOLDOWN_SEC = 60;



export default function EligibilityScreen() {

  const { products } = useLoanProducts();
  const { trackEvent } = useMarketing();

  const productOptions = (products as { apiKey?: string; label?: string }[])

    .filter((p) => p.apiKey)

    .map((p) => ({ value: p.apiKey!, label: p.label || p.apiKey! }));



  const [phase, setPhase] = useState<'gate' | 'form' | 'result'>('gate');

  const [fullName, setFullName] = useState('');

  const [mobile, setMobile] = useState('');

  const [email, setEmail] = useState('');

  const [mobileOtp, setMobileOtp] = useState('');

  const [emailOtp, setEmailOtp] = useState('');

  const [otpSent, setOtpSent] = useState(false);

  const [sending, setSending] = useState(false);

  const [verifying, setVerifying] = useState(false);

  const [resendTimer, setResendTimer] = useState(0);

  const [leadId, setLeadId] = useState('');

  const [otpSettings, setOtpSettings] = useState<{ requireMobileOtp: boolean; requireEmailOtp: boolean }>({
    requireMobileOtp: true,
    requireEmailOtp: true,
  });

  const [loanType, setLoanType] = useState(productOptions[0]?.value || 'personal_loan');

  const [amount, setAmount] = useState('');

  const [income, setIncome] = useState('');

  const [employment, setEmployment] = useState('salaried');

  const [creditScoreRange, setCreditScoreRange] = useState('700_749');

  const [result, setResult] = useState<Record<string, unknown> | null>(null);



  useEffect(() => {
    leadService
      .getOtpSettings()
      .then((s: { requireMobileOtp?: boolean; requireEmailOtp?: boolean }) => {
        setOtpSettings({
          requireMobileOtp: s?.requireMobileOtp !== false,
          requireEmailOtp: s?.requireEmailOtp !== false,
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  const startResendCooldown = () => setResendTimer(RESEND_COOLDOWN_SEC);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const requestOtp = async () => {
    if (!fullName.trim()) {
      Alert.alert('Name required', 'Please enter your full name.');
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      Alert.alert('Invalid email', 'Enter a valid email address.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      Alert.alert('Invalid mobile', 'Enter a valid 10-digit Indian mobile number.');
      return;
    }

    setSending(true);
    try {
      const res = await leadService.startVerification({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: mobile,
        loanType,
        source: 'eligibility',
        consentAccepted: true,
      });
      setLeadId(res?.lead?.id || res?.leadId || res?.id || '');
      setOtpSettings({
        requireMobileOtp: res?.requireMobileOtp !== false,
        requireEmailOtp: res?.requireEmailOtp !== false,
      });
      setOtpSent(true);
      setMobileOtp('');
      setEmailOtp('');
      startResendCooldown();
      const channels = [
        res?.requireMobileOtp !== false ? 'mobile' : null,
        res?.requireEmailOtp !== false ? 'email' : null,
      ].filter(Boolean);
      Alert.alert('OTP sent', `Enter the code sent to your ${channels.join(' and ')}.`);
    } catch (e: unknown) {
      Alert.alert('Could not send OTP', (e as Error).message || 'Try again.');
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    if (otpSettings.requireMobileOtp && mobileOtp.length !== 6) {
      Alert.alert('Mobile OTP required', 'Enter the 6-digit code sent to your mobile.');
      return;
    }
    if (otpSettings.requireEmailOtp && emailOtp.length !== 6) {
      Alert.alert('Email OTP required', 'Enter the 6-digit code sent to your email.');
      return;
    }

    setVerifying(true);
    try {
      const res = await leadService.verifyOtp({
        phone: mobile,
        email: email.trim(),
        mobileOtp: otpSettings.requireMobileOtp ? mobileOtp : undefined,
        emailOtp: otpSettings.requireEmailOtp ? emailOtp : undefined,
        leadId,
      });
      setLeadId(res?.lead?.id || res?.leadId || leadId);
      trackEvent('lead', { event_label: 'eligibility_gate_verified' });
      setPhase('form');
    } catch (e: unknown) {
      Alert.alert('Verification failed', (e as Error).message || 'Invalid or expired OTP.');
    } finally {
      setVerifying(false);
    }
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;
    setSending(true);
    try {
      await leadService.requestOtp({ phone: mobile, email: email.trim(), leadId });
      setMobileOtp('');
      setEmailOtp('');
      startResendCooldown();
      Alert.alert('OTP resent', 'A new code has been sent.');
    } catch (e: unknown) {
      Alert.alert('Could not resend', (e as Error).message || 'Try again.');
    } finally {
      setSending(false);
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

      const payload = saveEligibilityResults(res, formData);

      await AsyncStorage.setItem(ELIGIBILITY_SESSION_KEY, JSON.stringify({ result: res, formData, payload }));

      if (leadId) await leadService.updateLead(leadId, { eligibilityResult: res, ...formData });

      trackEvent('conversion', { event_label: 'eligibility_calculated', loan_type: loanType });
      setPhase('result');

    } catch (e: unknown) {

      Alert.alert('Error', (e as Error).message);

    }

  };



  if (phase === 'gate') {

    return (

      <Screen title="Eligibility — Verify" showBack headerRight={<CustomerHeaderActions />}>

        <Text style={styles.desc}>
          Verify your contact to check loan eligibility. We will send a 6-digit OTP to your mobile
          {otpSettings.requireEmailOtp ? ' and email' : ''}.
        </Text>

        <Input label="Full name" value={fullName} onChangeText={setFullName} editable={!otpSent} />

        <Input label="Mobile (10 digits)" value={mobile} onChangeText={(v) => setMobile(v.replace(/\D/g, '').slice(0, 10))} keyboardType="phone-pad" maxLength={10} editable={!otpSent} />

        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!otpSent} />

        {!otpSent ? (
          <Button title={sending ? 'Sending…' : 'Send OTP'} onPress={requestOtp} variant="customer" disabled={sending} />
        ) : (
          <>
            {otpSettings.requireMobileOtp ? (
              <Input
                label="OTP sent to your mobile"
                value={mobileOtp}
                onChangeText={(v) => setMobileOtp(v.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="6-digit code"
              />
            ) : null}

            {otpSettings.requireEmailOtp ? (
              <Input
                label="OTP sent to your email"
                value={emailOtp}
                onChangeText={(v) => setEmailOtp(v.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="6-digit code"
              />
            ) : null}

            <Button title={verifying ? 'Verifying…' : 'Verify & Continue'} onPress={verifyOtp} variant="customer" disabled={verifying} style={{ marginTop: 8 }} />

            <Button
              title={
                sending
                  ? 'Sending…'
                  : resendTimer > 0
                    ? `Resend OTP in ${resendTimer}s`
                    : 'Resend OTP'
              }
              variant="outline"
              onPress={resendOtp}
              disabled={sending || resendTimer > 0}
              style={{ marginTop: 8 }}
            />

            <Button
              title="Change details"
              variant="ghost"
              onPress={() => {
                setOtpSent(false);
                setMobileOtp('');
                setEmailOtp('');
                setResendTimer(0);
              }}
              style={{ marginTop: 4 }}
            />
          </>
        )}

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



  const formatInr = (value: unknown) => {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return '—';
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
  };

  const rawScore =
    (result?.overallProbability as number | undefined) ??
    (result?.score as number | undefined) ??
    (result?.eligibilityScore as number | undefined);
  const scoreLabel = Number.isFinite(Number(rawScore)) ? `${Math.round(Number(rawScore))}%` : '—';

  const STATUS_LABELS: Record<string, string> = {
    likely_approved: 'Likely approved',
    conditional: 'Conditional approval',
    unlikely: 'Unlikely with current parameters',
  };
  const statusLabel = STATUS_LABELS[String(result?.status ?? '')] || '';

  const eligibleAmountLabel = formatInr(result?.eligibleAmount);
  const maxEmiLabel = result?.maxMonthlyEmi ? formatInr(result?.maxMonthlyEmi) : '';

  return (

    <Screen title="Eligibility Results" showBack headerRight={<CustomerHeaderActions />}>

      <Card>

        <Text style={styles.score}>Approval Score: {scoreLabel}</Text>

        {statusLabel ? <Text style={styles.status}>{statusLabel}</Text> : null}

        <Text style={styles.amount}>Eligible Amount: {eligibleAmountLabel}</Text>

        {maxEmiLabel ? <Text style={styles.detail}>Max Monthly EMI: {maxEmiLabel}</Text> : null}

        <Text style={styles.msg}>{String(result?.message ?? '')}</Text>

      </Card>

      <Button title="Start Application" onPress={() => router.push({ pathname: '/(customer)/assessment', params: { loanType } })} variant="customer" />

      <Button title="Compare Banks" variant="outline" onPress={() => router.push('/(customer)/(tabs)/marketplace')} style={{ marginTop: 8 }} />

    </Screen>

  );

}



const styles = StyleSheet.create({

  desc: { color: colors.mutedForeground, marginBottom: 16 },

  score: { fontSize: 22, fontWeight: '700', color: colors.primary, marginBottom: 4 },

  status: { fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 10 },

  amount: { fontSize: 15, fontWeight: '600', color: colors.foreground },

  detail: { fontSize: 14, color: colors.foreground, marginTop: 4 },

  msg: { marginTop: 10, color: colors.mutedForeground, lineHeight: 20 },

});


