import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@/src/components/Screen';
import Input from '@/src/components/Input';
import Button from '@/src/components/Button';
import StatusBadge from '@/src/components/StatusBadge';
import SettingsSection from '@/src/components/agent/SettingsSection';
import { useAuth } from '@/src/contexts/AuthContext';
import { agentProfileService, resolveAvatarUrl } from '@/src/services/agentProfileService';
import { authService } from '@/src/services/authService';
import { colors } from '@/src/theme';

const OTP_LEN = 6;

type ProfileData = {
  profile?: {
    fullName?: string;
    agentCode?: string;
    accountStatus?: string;
    avatarUrl?: string;
    email?: string;
    isActive?: boolean;
  };
  bank?: {
    accountNumber?: string;
    accountNumberMasked?: string;
    bankName?: string;
    ifscCode?: string;
  };
  maskedMobile?: string;
  registeredEmail?: string;
};

function apiError(e: unknown): string {
  return (
    (e as { response?: { data?: { error?: string } } })?.response?.data?.error ||
    (e as Error)?.message ||
    'Something went wrong'
  );
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Include at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Include at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Include at least one number';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Include at least one special character';
  return null;
}

function OtpSentBanner({ text }: { text: string }) {
  return (
    <View style={styles.otpBanner}>
      <Ionicons name="checkmark-circle" size={18} color={colors.success} />
      <Text style={styles.otpBannerText}>{text}</Text>
    </View>
  );
}

export default function AgentSettingsScreen() {
  const { signOut, user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);

  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankOtp, setBankOtp] = useState('');
  const [bankOtpSent, setBankOtpSent] = useState(false);

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const [resetOtp, setResetOtp] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetOtpSent, setResetOtpSent] = useState(false);

  const [deactivateOtp, setDeactivateOtp] = useState('');
  const [deactivateConfirm, setDeactivateConfirm] = useState('');
  const [deactivateOtpSent, setDeactivateOtpSent] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = (await agentProfileService.getProfile()) as ProfileData;
      setProfile(data);
      setNewEmail(data.registeredEmail || data.profile?.email || '');
      if (data.bank) {
        setBankAccount(data.bank.accountNumber || '');
        setBankName(data.bank.bankName || '');
        setIfscCode(data.bank.ifscCode || '');
      }
    } catch (e) {
      setError(apiError(e));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const avatarUri = resolveAvatarUrl(profile.profile?.avatarUrl);

  const uploadPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to upload a profile picture.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (res.canceled) return;

    setBusy('photo');
    setMessage('');
    setError('');
    try {
      const asset = res.assets[0];
      const uploaded = await agentProfileService.uploadPhoto({
        uri: asset.uri,
        name: asset.fileName || 'photo.jpg',
        type: asset.mimeType || 'image/jpeg',
      });
      setMessage('Profile photo updated');
      setProfile((prev) => ({
        ...prev,
        profile: { ...prev.profile, avatarUrl: uploaded.avatarUrl },
      }));
    } catch (e) {
      setError(apiError(e));
    }
    setBusy('');
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out of your agent account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(agent)/login');
        },
      },
    ]);
  };

  const handleChangePassword = async () => {
    setMessage('');
    setError('');
    const validation = validatePassword(newPass);
    if (validation) {
      setError(validation);
      return;
    }
    if (newPass !== confirmPass) {
      setError('New passwords do not match');
      return;
    }
    setBusy('password');
    try {
      const { error: changeError } = await authService.changePassword(currentPass, newPass);
      if (changeError) throw new Error(changeError.message);
      setMessage('Password changed successfully');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (e) {
      setError(apiError(e));
    }
    setBusy('');
  };

  const handleRequestResetOtp = async () => {
    setBusy('reset-otp');
    setMessage('');
    setError('');
    try {
      await agentProfileService.requestPasswordResetOtp();
      setResetOtpSent(true);
      setMessage('OTP sent to your registered email');
    } catch (e) {
      setError(apiError(e));
    }
    setBusy('');
  };

  const handleResetPassword = async () => {
    setMessage('');
    setError('');
    const validation = validatePassword(resetPassword);
    if (validation) {
      setError(validation);
      return;
    }
    if (resetPassword !== resetConfirm) {
      setError('Passwords do not match');
      return;
    }
    if (resetOtp.length !== OTP_LEN) {
      setError('Enter the 6-digit OTP');
      return;
    }
    setBusy('reset');
    try {
      await agentProfileService.confirmPasswordReset(resetOtp, resetPassword);
      Alert.alert('Password reset', 'Password updated. Please sign in again.', [
        {
          text: 'OK',
          onPress: async () => {
            await signOut();
            router.replace('/(agent)/login');
          },
        },
      ]);
    } catch (e) {
      setError(apiError(e));
    }
    setBusy('');
  };

  const handleRequestEmailOtp = async () => {
    if (!newEmail.trim()) {
      setError('Enter a new email address');
      return;
    }
    setBusy('email-otp');
    setMessage('');
    setError('');
    try {
      await agentProfileService.requestEmailOtp(newEmail.trim());
      setEmailOtpSent(true);
      setMessage(`OTP sent to ${profile.maskedMobile || 'your registered mobile'}`);
    } catch (e) {
      setError(apiError(e));
    }
    setBusy('');
  };

  const handleConfirmEmail = async () => {
    if (emailOtp.length !== OTP_LEN) {
      setError('Enter the 6-digit OTP');
      return;
    }
    setBusy('email');
    setMessage('');
    setError('');
    try {
      await agentProfileService.confirmEmail(newEmail.trim(), emailOtp);
      setMessage('Email updated successfully');
      setEmailOtp('');
      setEmailOtpSent(false);
      await loadProfile();
    } catch (e) {
      setError(apiError(e));
    }
    setBusy('');
  };

  const handleRequestBankOtp = async () => {
    if (!bankAccount.trim() || !bankName.trim() || !ifscCode.trim()) {
      setError('Fill in account number, bank name, and IFSC');
      return;
    }
    setBusy('bank-otp');
    setMessage('');
    setError('');
    try {
      await agentProfileService.requestBankOtp({
        accountNumber: bankAccount.trim(),
        bankName: bankName.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
      });
      setBankOtpSent(true);
      setMessage(`OTP sent to ${profile.maskedMobile || 'your registered mobile'}`);
    } catch (e) {
      setError(apiError(e));
    }
    setBusy('');
  };

  const handleConfirmBank = async () => {
    if (bankOtp.length !== OTP_LEN) {
      setError('Enter the 6-digit OTP');
      return;
    }
    setBusy('bank');
    setMessage('');
    setError('');
    try {
      await agentProfileService.confirmBank({
        otp: bankOtp,
        accountNumber: bankAccount.trim(),
        bankName: bankName.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
      });
      setMessage('Commission bank details updated');
      setBankOtp('');
      setBankOtpSent(false);
      await loadProfile();
    } catch (e) {
      setError(apiError(e));
    }
    setBusy('');
  };

  const handleRequestDeactivateOtp = async () => {
    setBusy('deact-otp');
    setMessage('');
    setError('');
    try {
      await agentProfileService.requestDeactivateOtp();
      setDeactivateOtpSent(true);
      setMessage('OTP sent to confirm deactivation');
    } catch (e) {
      setError(apiError(e));
    }
    setBusy('');
  };

  const handleDeactivate = async () => {
    if (deactivateConfirm !== 'DEACTIVATE') {
      setError('Type DEACTIVATE to confirm');
      return;
    }
    if (deactivateOtp.length !== OTP_LEN) {
      setError('Enter the 6-digit OTP');
      return;
    }
    setBusy('deactivate');
    setMessage('');
    setError('');
    try {
      await agentProfileService.confirmDeactivate(deactivateOtp, 'DEACTIVATE');
      await signOut();
      router.replace('/(agent)/login');
    } catch (e) {
      setError(apiError(e));
    }
    setBusy('');
  };

  return (
    <Screen title="Agent Settings" loading={loading}>
      {message ? (
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <Text style={styles.successText}>{message}</Text>
        </View>
      ) : null}
      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={colors.destructive} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.profileCard}>
        <View style={styles.avatarRing}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={36} color={colors.agent} />
            </View>
          )}
          <TouchableOpacity style={styles.cameraBtn} onPress={uploadPhoto} disabled={busy === 'photo'}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.profileName}>{profile.profile?.fullName || user?.email || 'Agent'}</Text>
        <Text style={styles.profileEmail}>{profile.registeredEmail || user?.email}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.codeBadge}>
            <Ionicons name="id-card-outline" size={14} color={colors.agent} />
            <Text style={styles.codeText}>Code: {profile.profile?.agentCode || '—'}</Text>
          </View>
          <StatusBadge status={profile.profile?.accountStatus || 'active'} />
        </View>
        {profile.maskedMobile ? (
          <Text style={styles.maskedMobile}>OTP mobile: {profile.maskedMobile}</Text>
        ) : null}
        <Button
          title="Change Photo"
          variant="outline"
          onPress={uploadPhoto}
          loading={busy === 'photo'}
          style={styles.photoBtn}
        />
      </View>

      <SettingsSection
        title="Change Email"
        description="Verify with OTP sent to your registered mobile number."
        icon="mail"
        iconBg="#EDE9FE"
        iconColor="#6D28D9"
      >
        <Input label="New Email" value={newEmail} onChangeText={setNewEmail} keyboardType="email-address" autoCapitalize="none" />
        <Button title="Request Email OTP" variant="outline" onPress={handleRequestEmailOtp} loading={busy === 'email-otp'} />
        {emailOtpSent ? <OtpSentBanner text={`OTP sent to ${profile.maskedMobile || 'registered mobile'}`} /> : null}
        <Input
          label="OTP"
          value={emailOtp}
          onChangeText={(v) => setEmailOtp(v.replace(/\D/g, '').slice(0, OTP_LEN))}
          keyboardType="number-pad"
          maxLength={OTP_LEN}
        />
        <Button title="Confirm Email" variant="agent" onPress={handleConfirmEmail} loading={busy === 'email'} />
      </SettingsSection>

      <SettingsSection
        title="Commission Bank Account"
        description="Bank details used for commission payouts. OTP verification required."
        icon="card"
        iconBg="#DBEAFE"
        iconColor="#1D4ED8"
      >
        {profile.bank?.accountNumberMasked ? (
          <Text style={styles.currentBank}>Current account: {profile.bank.accountNumberMasked}</Text>
        ) : null}
        <Input label="Account Number" value={bankAccount} onChangeText={setBankAccount} keyboardType="number-pad" />
        <Input label="Bank Name" value={bankName} onChangeText={setBankName} />
        <Input label="IFSC Code" value={ifscCode} onChangeText={setIfscCode} autoCapitalize="characters" />
        <Button title="Request Bank OTP" variant="outline" onPress={handleRequestBankOtp} loading={busy === 'bank-otp'} />
        {bankOtpSent ? <OtpSentBanner text={`OTP sent to ${profile.maskedMobile || 'registered mobile'}`} /> : null}
        <Input
          label="OTP"
          value={bankOtp}
          onChangeText={(v) => setBankOtp(v.replace(/\D/g, '').slice(0, OTP_LEN))}
          keyboardType="number-pad"
          maxLength={OTP_LEN}
        />
        <Button title="Confirm Bank Details" variant="agent" onPress={handleConfirmBank} loading={busy === 'bank'} />
      </SettingsSection>

      <SettingsSection
        title="Change Password"
        description="Update your password while signed in."
        icon="lock-closed"
      >
        <Input label="Current Password" value={currentPass} onChangeText={setCurrentPass} secureTextEntry />
        <Input label="New Password" value={newPass} onChangeText={setNewPass} secureTextEntry />
        <Input label="Confirm New Password" value={confirmPass} onChangeText={setConfirmPass} secureTextEntry />
        <Button title="Change Password" variant="agent" onPress={handleChangePassword} loading={busy === 'password'} />
      </SettingsSection>

      <SettingsSection
        title="Reset Password (OTP)"
        description="Forgot your password? Request an OTP to your registered email."
        icon="key"
        iconBg="#FEF3C7"
        iconColor="#B45309"
      >
        <Button title="Request Reset OTP" variant="outline" onPress={handleRequestResetOtp} loading={busy === 'reset-otp'} />
        {resetOtpSent ? <OtpSentBanner text="OTP sent to your registered email" /> : null}
        <Input
          label="OTP"
          value={resetOtp}
          onChangeText={(v) => setResetOtp(v.replace(/\D/g, '').slice(0, OTP_LEN))}
          keyboardType="number-pad"
          maxLength={OTP_LEN}
        />
        <Input label="New Password" value={resetPassword} onChangeText={setResetPassword} secureTextEntry />
        <Input label="Confirm New Password" value={resetConfirm} onChangeText={setResetConfirm} secureTextEntry />
        <Button title="Confirm Reset" variant="agent" onPress={handleResetPassword} loading={busy === 'reset'} />
      </SettingsSection>

      <SettingsSection
        title="Deactivate Account"
        description="Permanently deactivate your agent code and account. This cannot be undone easily."
        icon="warning"
        iconBg="#FEE2E2"
        danger
      >
        <Button
          title="Request Deactivate OTP"
          variant="outline"
          onPress={handleRequestDeactivateOtp}
          loading={busy === 'deact-otp'}
        />
        {deactivateOtpSent ? <OtpSentBanner text="OTP sent to your registered mobile" /> : null}
        <Input
          label="OTP"
          value={deactivateOtp}
          onChangeText={(v) => setDeactivateOtp(v.replace(/\D/g, '').slice(0, OTP_LEN))}
          keyboardType="number-pad"
          maxLength={OTP_LEN}
        />
        <Input
          label='Type "DEACTIVATE" to confirm'
          value={deactivateConfirm}
          onChangeText={setDeactivateConfirm}
          autoCapitalize="characters"
          placeholder="DEACTIVATE"
        />
        <Button title="Deactivate My Account" variant="destructive" onPress={handleDeactivate} loading={busy === 'deactivate'} />
      </SettingsSection>

      <View style={styles.signOutWrap}>
        <Button title="Sign Out" variant="outline" onPress={handleSignOut} style={styles.signOutBtn} />
        <Text style={styles.signOutHint}>You will return to the agent login screen.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: colors.agent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.agent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  profileName: { fontSize: 20, fontWeight: '700', color: colors.foreground },
  profileEmail: { fontSize: 13, color: colors.mutedForeground, marginTop: 4 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  codeText: { fontSize: 12, fontWeight: '600', color: colors.agent },
  maskedMobile: { fontSize: 12, color: colors.mutedForeground, marginTop: 8 },
  photoBtn: { marginTop: 12, alignSelf: 'stretch' },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D1FAE5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  successText: { flex: 1, color: '#065F46', fontSize: 13 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { flex: 1, color: colors.destructive, fontSize: 13 },
  otpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.muted,
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
  },
  otpBannerText: { flex: 1, fontSize: 12, color: colors.foreground },
  currentBank: { fontSize: 12, color: colors.mutedForeground, marginBottom: 8 },
  signOutWrap: { marginTop: 8, marginBottom: 24, alignItems: 'center' },
  signOutBtn: { alignSelf: 'stretch', borderColor: colors.destructive },
  signOutHint: { fontSize: 11, color: colors.mutedForeground, marginTop: 8, textAlign: 'center' },
});
