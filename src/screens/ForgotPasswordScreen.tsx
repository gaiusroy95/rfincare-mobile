import React, { useState } from 'react';
import { Text, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import Screen from '@/src/components/Screen';
import BrandLogo from '@/src/components/BrandLogo';
import Input from '@/src/components/Input';
import Button from '@/src/components/Button';
import Select from '@/src/components/Select';
import { authService } from '@/src/services/authService';
import { colors } from '@/src/theme';

type Props = {
  /** 'customer' | 'agent' — controls button styling and post-reset navigation */
  variant?: 'customer' | 'agent';
  /** Route to return to after successful reset */
  loginRoute?: string;
};

const OTP_LEN = 6;

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Include at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Include at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Include at least one number';
  return null;
}

export default function ForgotPasswordScreen({
  variant = 'customer',
  loginRoute = '/(customer)/login',
}: Props) {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [channel, setChannel] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const btnVariant = variant === 'agent' ? 'agent' : 'customer';

  const requestOtp = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      Alert.alert('Email required', 'Enter the email address linked to your account.');
      return;
    }

    setBusy(true);
    const { error } = await authService.requestPasswordResetOtp(trimmed, channel);
    setBusy(false);

    if (error) {
      Alert.alert('Could not send OTP', error.message);
      return;
    }

    setOtp('');
    setStep('reset');
    Alert.alert('OTP sent', `A 6-digit code was sent to your ${channel}. Check your inbox or phone.`);
  };

  const confirmReset = async () => {
    const trimmed = email.trim().toLowerCase();

    if (otp.length !== OTP_LEN) {
      Alert.alert('OTP required', 'Enter the 6-digit code.');
      return;
    }

    const pwErr = validatePassword(newPassword);
    if (pwErr) {
      Alert.alert('Weak password', pwErr);
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords do not match', 'New password and confirmation must match.');
      return;
    }

    setBusy(true);
    const { error } = await authService.confirmPasswordReset(trimmed, otp, newPassword);
    setBusy(false);

    if (error) {
      Alert.alert('Reset failed', error.message);
      return;
    }

    Alert.alert('Password reset', 'Your password has been updated. Please sign in.', [
      { text: 'Sign in', onPress: () => router.replace(loginRoute as never) },
    ]);
  };

  return (
    <Screen title="Reset Password" showBack>
      <BrandLogo style={{ marginBottom: 20 }} />

      <Text style={styles.intro}>
        {step === 'email'
          ? 'Enter your registered email. We will send a one-time code so you can set a new password — no current password needed.'
          : 'Enter the OTP you received and choose a new password.'}
      </Text>

      {step === 'email' ? (
        <>
          <Input
            label="Registered email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Select
            label="Send OTP via"
            value={channel}
            options={[
              { value: 'email', label: 'Email' },
              { value: 'sms', label: 'SMS' },
              { value: 'whatsapp', label: 'WhatsApp' },
            ]}
            onChange={(v) => setChannel(v as 'email' | 'sms' | 'whatsapp')}
          />
          <Button
            title={busy ? 'Sending…' : 'Send OTP'}
            onPress={requestOtp}
            loading={busy}
            variant={btnVariant}
          />
        </>
      ) : (
        <>
          <Text style={styles.emailHint}>Code sent to {email.trim().toLowerCase()}</Text>
          <Input
            label="6-digit OTP"
            value={otp}
            onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, OTP_LEN))}
            keyboardType="number-pad"
            maxLength={OTP_LEN}
          />
          <Input
            label="New password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          <Input
            label="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          <Text style={styles.hint}>
            At least 8 characters with uppercase, lowercase, and a number.
          </Text>
          <Button
            title={busy ? 'Resetting…' : 'Reset Password'}
            onPress={confirmReset}
            loading={busy}
            variant={btnVariant}
          />
          <Button
            title="Resend OTP"
            variant="outline"
            onPress={() => {
              setStep('email');
              setOtp('');
            }}
            style={{ marginTop: 8 }}
          />
        </>
      )}

      <Button
        title="Back to sign in"
        variant="ghost"
        onPress={() => router.replace(loginRoute as never)}
        style={{ marginTop: 16 }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: 14,
    color: colors.mutedForeground,
    lineHeight: 20,
    marginBottom: 16,
  },
  emailHint: {
    fontSize: 13,
    color: colors.mutedForeground,
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: 12,
    marginTop: -4,
  },
});
