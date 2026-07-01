import React, { useEffect, useState } from 'react';
import { Text, FlatList, Alert } from 'react-native';
import Screen from '@/src/components/Screen';
import Input from '@/src/components/Input';
import Button from '@/src/components/Button';
import Card from '@/src/components/Card';
import { apiClient } from '@/src/api/apiClient';
import { authService } from '@/src/services/authService';
import { colors } from '@/src/theme';

const OTP_LEN = 6;

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Include at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Include at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Include at least one number';
  return null;
}

export default function PasswordManagementScreen() {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [busy, setBusy] = useState('');
  const [sessions, setSessions] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    apiClient.get('/auth/sessions').then((r) => setSessions(r.data?.sessions || [])).catch(() => {});
  }, []);

  const validateFields = () => {
    if (!current) return 'Enter your current password';
    if (!newPass || !confirm) return 'Enter and confirm your new password';
    const pwErr = validatePassword(newPass);
    if (pwErr) return pwErr;
    if (newPass !== confirm) return 'New passwords do not match';
    if (current === newPass) return 'New password must be different from current password';
    return null;
  };

  const startChange = async () => {
    const err = validateFields();
    if (err) {
      Alert.alert('Check your passwords', err);
      return;
    }
    setBusy('otp');
    const { error } = await authService.requestAuthenticatedPasswordResetOtp('email');
    setBusy('');
    if (error) {
      Alert.alert('Could not send OTP', error.message);
      return;
    }
    setOtpStep(true);
    setOtp('');
    Alert.alert('OTP sent', 'Enter the 6-digit code sent to your registered email.');
  };

  const confirmChange = async () => {
    const err = validateFields();
    if (err) {
      Alert.alert('Check your passwords', err);
      return;
    }
    if (otp.length !== OTP_LEN) {
      Alert.alert('OTP required', 'Enter the 6-digit code.');
      return;
    }
    setBusy('submit');
    const { error } = await authService.confirmAuthenticatedPasswordReset(otp, newPass, current);
    setBusy('');
    if (error) {
      Alert.alert('Change failed', error.message);
      return;
    }
    Alert.alert('Password updated', 'Please sign in again with your new password.');
  };

  const revokeSession = async (id: string) => {
    await apiClient.delete(`/auth/sessions/${id}`);
    setSessions((s) => s.filter((x) => x.id !== id));
  };

  return (
    <Screen title="Change Password" showBack>
      <Text style={{ color: colors.mutedForeground, marginBottom: 16, fontSize: 14 }}>
        Enter your current and new password, then tap Change password. An OTP will be sent to verify
        the change.
      </Text>
      <Input label="Current Password" value={current} onChangeText={setCurrent} secureTextEntry />
      <Input label="New Password" value={newPass} onChangeText={setNewPass} secureTextEntry />
      <Input label="Confirm Password" value={confirm} onChangeText={setConfirm} secureTextEntry />
      {otpStep ? (
        <>
          <Input
            label="OTP code"
            value={otp}
            onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, OTP_LEN))}
            keyboardType="number-pad"
            maxLength={OTP_LEN}
            placeholder="6-digit code"
          />
          <Button
            title="Verify OTP & change password"
            onPress={confirmChange}
            variant="customer"
            loading={busy === 'submit'}
          />
        </>
      ) : (
        <Button title="Change password" onPress={startChange} variant="customer" loading={busy === 'otp'} />
      )}
      <Text style={{ marginTop: 20, fontWeight: '700' }}>Active Sessions</Text>
      <FlatList
        data={sessions}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Card>
            <Text>{String(item.userAgent || 'Session')}</Text>
            <Button title="Revoke" variant="destructive" onPress={() => revokeSession(String(item.id))} style={{ marginTop: 8 }} />
          </Card>
        )}
      />
    </Screen>
  );
}
