import React, { useState } from 'react';
import { Text, StyleSheet, Alert } from 'react-native';
import Input from '@/src/components/Input';
import Button from '@/src/components/Button';
import Checkbox from '@/src/components/Checkbox';
import RadioGroup from '@/src/components/RadioGroup';
import SignaturePad from '@/src/components/SignaturePad';
import { apiClient } from '@/src/api/apiClient';
// @ts-expect-error JS module
import { applicationAuthService } from '@/src/services/applicationAuthService';
import { colors } from '@/src/theme';
import type { AssessmentFormData } from './types';

type Props = {
  form: AssessmentFormData;
  applicationId: string;
  onChange: (key: keyof AssessmentFormData, value: unknown) => void;
  onVerified: () => void;
};

export default function ConsentSignatureForm({ form, applicationId, onChange, onVerified }: Props) {
  const [otp, setOtp] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const requestOtp = async () => {
    setRequesting(true);
    try {
      await applicationAuthService.requestOtp({ applicationId });
      Alert.alert('OTP sent', 'Check your registered mobile number.');
    } catch (e) {
      Alert.alert('Error', (e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to send OTP');
    }
    setRequesting(false);
  };

  const verifyOtp = async () => {
    setVerifying(true);
    try {
      await applicationAuthService.verifyOtp({ applicationId, otp });
      onChange('otpVerified', true);
      onVerified();
      Alert.alert('Verified', 'OTP verified successfully.');
    } catch (e) {
      Alert.alert('Error', (e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Invalid OTP');
    }
    setVerifying(false);
  };

  return (
    <>
      <Checkbox
        label="I agree to the consent terms and authorize submission of this application."
        checked={form.consentSignatureAgreed}
        onChange={(v) => onChange('consentSignatureAgreed', v)}
      />
      <RadioGroup
        label="Verification method"
        value={form.submitAuthMethod}
        options={[
          { value: 'otp', label: 'OTP verification', description: 'Receive OTP on registered mobile' },
          { value: 'signature', label: 'Digital signature', description: 'Draw your signature below' },
        ]}
        onChange={(v) => onChange('submitAuthMethod', v as 'otp' | 'signature')}
      />
      {form.submitAuthMethod === 'otp' ? (
        <>
          <Button title="Request OTP" variant="outline" onPress={requestOtp} loading={requesting} />
          <Input label="OTP" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} />
          <Button title="Verify OTP" variant="customer" onPress={verifyOtp} loading={verifying} />
        </>
      ) : (
        <SignaturePad
          onSignature={(sig) => {
            onChange('customerSignature', sig);
            onChange('otpVerified', true);
            onVerified();
          }}
        />
      )}
      {form.otpVerified ? <Text style={styles.ok}>✓ Identity verified</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  ok: { color: colors.success, fontWeight: '600', marginTop: 8 },
});
