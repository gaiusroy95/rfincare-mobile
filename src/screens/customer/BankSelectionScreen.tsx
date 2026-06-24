import React, { useEffect, useState } from 'react';

import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';

import { router } from 'expo-router';

import Screen from '@/src/components/Screen';

import Card from '@/src/components/Card';

import BankLogo from '@/src/components/BankLogo';

import Button from '@/src/components/Button';

import Input from '@/src/components/Input';

import Checkbox from '@/src/components/Checkbox';

import ProgressIndicator from '@/src/components/ProgressIndicator';

import LoadingOverlay from '@/src/components/LoadingOverlay';

import { colors } from '@/src/theme';

import { useAuth } from '@/src/contexts/AuthContext';

import { apiClient } from '@/src/api/apiClient';

// @ts-expect-error JS module

import { bankService } from '@/src/services/apiServices';

// @ts-expect-error JS module

import { applicationService } from '@/src/services/applicationService';

// @ts-expect-error JS module

import { applicationAuthService } from '@/src/services/applicationAuthService';

// @ts-expect-error JS module

import { getBankLogoUrl } from '@/src/utils/bankBranding';



const STEPS = [

  { id: 'bank', label: 'Select Bank' },

  { id: 'consent', label: 'Consents' },

  { id: 'otp', label: 'Verify OTP' },

  { id: 'confirm', label: 'Confirmation' },

];



const REQUIRED_CONSENTS = ['dataSharing', 'creditCheck', 'termsConditions', 'privacyPolicy'];



type Bank = { id: string; name: string; logo?: string };



export default function BankSelectionScreen() {

  const { user } = useAuth();

  const [step, setStep] = useState(0);

  const [banks, setBanks] = useState<Bank[]>([]);

  const [selectedBankId, setSelectedBankId] = useState('');

  const [consents, setConsents] = useState<Record<string, boolean>>({});

  const [consentErrors, setConsentErrors] = useState<Record<string, string>>({});

  const [appId, setAppId] = useState('');

  const [appData, setAppData] = useState<Record<string, unknown> | null>(null);

  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(true);

  const [verifying, setVerifying] = useState(false);



  useEffect(() => {

    (async () => {

      try {

        const data = await bankService.getAllBanks();

        const list = (Array.isArray(data) ? data : []).map((b: Record<string, unknown>) => ({

          id: String(b.id),

          name: String(b.name),

          logo: getBankLogoUrl(b),

        }));

        setBanks(list);



        const appsRes = await apiClient.get('/loan-applications/me');

        const apps = Array.isArray(appsRes.data) ? appsRes.data : appsRes.data?.data || [];

        const draft = apps.find((a: { status?: string }) => ['draft', 'in_progress'].includes(a.status || '')) || apps[0];

        if (draft?.id) {

          setAppId(draft.id);

          setAppData(draft);

        } else if (user) {

          const { data, error } = await applicationService.createApplication({

            firstName: user.firstName || 'Customer',

            lastName: user.lastName || '',

            email: user.email,

            phone: user.phone,

            status: 'draft',

          });

          if (!error && data?.id) {

            setAppId(data.id);

            setAppData(data);

          }

        }

      } catch {

        /* best-effort */

      }

      setLoading(false);

    })();

  }, [user]);



  const validateConsents = () => {

    const errs: Record<string, string> = {};

    REQUIRED_CONSENTS.forEach((c) => {

      if (!consents[c]) errs[c] = 'Required';

    });

    setConsentErrors(errs);

    return Object.keys(errs).length === 0;

  };



  const next = async () => {

    if (step === 0) {

      if (!selectedBankId) {

        Alert.alert('Select bank', 'Please select a bank to continue.');

        return;

      }

      setStep(1);

      return;

    }

    if (step === 1) {

      if (!validateConsents()) return;

      const { error } = await applicationService.saveConsents(appId, consents);

      if (error) {

        Alert.alert('Error', error.message || 'Failed to save consents');

        return;

      }

      try {

        await apiClient.post('/auth/application/request-otp', {

          applicationId: appId,

          phone: appData?.phone || user?.phone,

          email: appData?.email || user?.email,

        });

        Alert.alert('OTP sent', 'Check your registered mobile.');

      } catch {

        await applicationAuthService.requestOtp({

          phone: String(appData?.phone || user?.phone || ''),

          email: String(appData?.email || user?.email || ''),

        });

      }

      setStep(2);

      return;

    }

    if (step === 2) {

      setVerifying(true);

      try {

        try {

          await apiClient.post('/auth/application/verify-otp', { applicationId: appId, otp });

        } catch {

          await applicationAuthService.verifyOtp({

            phone: String(appData?.phone || user?.phone || ''),

            otp,

            email: String(appData?.email || user?.email || ''),

          });

        }

        const { error } = await applicationService.submitApplication(appId, selectedBankId);

        if (error) throw new Error(error.message);

        setStep(3);

      } catch (e) {

        Alert.alert('Verification failed', (e as Error).message || 'Invalid OTP');

      }

      setVerifying(false);

    }

  };



  const selectedBank = banks.find((b) => b.id === selectedBankId);



  return (

    <Screen title={`Bank Selection — ${STEPS[step].label}`} loading={loading}>

      <LoadingOverlay visible={verifying} message="Verifying…" />

      <ProgressIndicator steps={STEPS} currentStep={step} />



      {step === 0 && banks.map((b) => (

        <Card key={b.id}>

          <View style={styles.bankRow}>

            <BankLogo uri={b.logo} size={40} style={styles.logo} backgroundColor={colors.muted} />

            <Text style={styles.bankName}>{b.name}</Text>

          </View>

          <Button

            title={selectedBankId === b.id ? 'Selected' : 'Select'}

            variant={selectedBankId === b.id ? 'customer' : 'outline'}

            onPress={() => setSelectedBankId(b.id)}

          />

        </Card>

      ))}



      {step === 1 && (

        <>

          <Checkbox label="I consent to share my data with the selected bank" checked={!!consents.dataSharing} onChange={(v) => setConsents((c) => ({ ...c, dataSharing: v }))} />

          {consentErrors.dataSharing ? <Text style={styles.err}>{consentErrors.dataSharing}</Text> : null}

          <Checkbox label="I authorize credit checks" checked={!!consents.creditCheck} onChange={(v) => setConsents((c) => ({ ...c, creditCheck: v }))} />

          {consentErrors.creditCheck ? <Text style={styles.err}>{consentErrors.creditCheck}</Text> : null}

          <Checkbox label="I agree to Terms & Conditions" checked={!!consents.termsConditions} onChange={(v) => setConsents((c) => ({ ...c, termsConditions: v }))} />

          {consentErrors.termsConditions ? <Text style={styles.err}>{consentErrors.termsConditions}</Text> : null}

          <Checkbox label="I agree to the Privacy Policy" checked={!!consents.privacyPolicy} onChange={(v) => setConsents((c) => ({ ...c, privacyPolicy: v }))} />

          {consentErrors.privacyPolicy ? <Text style={styles.err}>{consentErrors.privacyPolicy}</Text> : null}

          <Checkbox label="Communication consent (optional)" checked={!!consents.communicationConsent} onChange={(v) => setConsents((c) => ({ ...c, communicationConsent: v }))} />

          <Checkbox label="Marketing consent (optional)" checked={!!consents.marketingConsent} onChange={(v) => setConsents((c) => ({ ...c, marketingConsent: v }))} />

        </>

      )}



      {step === 2 && (

        <>

          <Text style={styles.hint}>OTP sent to your registered mobile for {selectedBank?.name}.</Text>

          <Input label="OTP" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} />

        </>

      )}



      {step === 3 && (

        <Card>

          <Text style={styles.success}>Application submitted to {selectedBank?.name}!</Text>

          <Text style={styles.hint}>Complete the additional questionnaire for faster processing.</Text>

          <Button title="Continue to Questionnaire" variant="customer" onPress={() => router.push('/(customer)/questionnaire')} style={{ marginTop: 12 }} />

          <Button title="Go to Dashboard" variant="outline" onPress={() => router.push('/(customer)/(tabs)/dashboard')} style={{ marginTop: 8 }} />

        </Card>

      )}



      {step < 3 && (

        <View style={styles.nav}>

          {step > 0 && <Button title="Back" variant="outline" onPress={() => setStep(step - 1)} style={{ flex: 1, marginRight: 4 }} />}

          <Button title={step === 2 ? 'Verify & Submit' : 'Continue'} onPress={next} variant="customer" style={{ flex: 1, marginLeft: 4 }} loading={verifying} />

        </View>

      )}

    </Screen>

  );

}



const styles = StyleSheet.create({

  bankRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 12 },

  logo: { width: 40, height: 40, borderRadius: 8 },

  bankName: { fontSize: 16, fontWeight: '600', flex: 1 },

  hint: { color: colors.mutedForeground, marginBottom: 12 },

  err: { color: colors.destructive, fontSize: 12, marginBottom: 8, marginTop: -8 },

  success: { fontSize: 18, fontWeight: '700', color: colors.success, marginBottom: 8 },

  nav: { flexDirection: 'row', marginTop: 16 },

});


