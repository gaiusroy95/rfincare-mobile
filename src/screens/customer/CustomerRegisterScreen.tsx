import React, { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import Screen from '@/src/components/Screen';
import Button from '@/src/components/Button';
import Input from '@/src/components/Input';
import ContactDataConsentBlock from '@/src/components/ContactDataConsentBlock';
// @ts-expect-error JS module
import { authService } from '@/src/services/authService';

const STEPS = ['Email', 'Demographics', 'Employment', 'Bank Info'];

export default function CustomerRegisterScreen() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    email: '', fullName: '', phone: '', dateOfBirth: '', gender: '',
    addressLine1: '', city: '', state: '', pinCode: '',
    employmentType: '', employerName: '', annualIncome: '',
    bankName: '', accountName: '',
  });
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [contactConsentAccepted, setContactConsentAccepted] = useState(false);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!termsAccepted || !contactConsentAccepted) {
      Alert.alert('Consent required', 'Please accept the terms and contact consent before registering.');
      return;
    }
    setLoading(true);
    try {
      await authService.signUpCustomer(form);
      Alert.alert('Success', 'Registration submitted!', [{ text: 'OK', onPress: () => router.replace('/(customer)/(tabs)/dashboard') }]);
    } catch (e: unknown) {
      Alert.alert('Error', (e as Error).message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <Screen title={`Register — ${STEPS[step]}`}>
      {step === 0 && (
        <>
          <Input label="Email" value={form.email} onChangeText={(v) => update('email', v)} keyboardType="email-address" />
          <Input label="Full Name" value={form.fullName} onChangeText={(v) => update('fullName', v)} />
          <Input label="Phone" value={form.phone} onChangeText={(v) => update('phone', v)} keyboardType="phone-pad" />
          <ContactDataConsentBlock
            termsAccepted={termsAccepted}
            contactConsentAccepted={contactConsentAccepted}
            onTermsChange={setTermsAccepted}
            onContactConsentChange={setContactConsentAccepted}
          />
        </>
      )}
      {step === 1 && (
        <>
          <Input label="Date of Birth" value={form.dateOfBirth} onChangeText={(v) => update('dateOfBirth', v)} placeholder="YYYY-MM-DD" />
          <Input label="Gender" value={form.gender} onChangeText={(v) => update('gender', v)} />
          <Input label="Address" value={form.addressLine1} onChangeText={(v) => update('addressLine1', v)} />
          <Input label="City" value={form.city} onChangeText={(v) => update('city', v)} />
          <Input label="State" value={form.state} onChangeText={(v) => update('state', v)} />
          <Input label="PIN Code" value={form.pinCode} onChangeText={(v) => update('pinCode', v)} keyboardType="number-pad" maxLength={6} />
        </>
      )}
      {step === 2 && (
        <>
          <Input label="Employment Type" value={form.employmentType} onChangeText={(v) => update('employmentType', v)} />
          <Input label="Employer Name" value={form.employerName} onChangeText={(v) => update('employerName', v)} />
          <Input label="Annual Income (₹)" value={form.annualIncome} onChangeText={(v) => update('annualIncome', v)} keyboardType="numeric" />
        </>
      )}
      {step === 3 && (
        <>
          <Input label="Bank Name" value={form.bankName} onChangeText={(v) => update('bankName', v)} />
          <Input label="Account Name" value={form.accountName} onChangeText={(v) => update('accountName', v)} />
        </>
      )}
      {step < 3 ? (
        <Button
          title="Next"
          onPress={() => {
            if (step === 0 && (!termsAccepted || !contactConsentAccepted)) {
              Alert.alert('Consent required', 'Please accept the terms and contact consent to continue.');
              return;
            }
            setStep(step + 1);
          }}
          variant="customer"
        />
      ) : (
        <Button title="Submit Registration" onPress={submit} loading={loading} variant="customer" />
      )}
      {step > 0 && <Button title="Back" variant="outline" onPress={() => setStep(step - 1)} style={{ marginTop: 8 }} />}
    </Screen>
  );
}
