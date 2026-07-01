import React, { useState } from 'react';
import { Alert, Text, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Screen from '@/src/components/Screen';
import Input from '@/src/components/Input';
import Button from '@/src/components/Button';
import FilePicker, { type PickedFile } from '@/src/components/FilePicker';
import { partnerService } from '@/src/services/partnerService';
import { colors } from '@/src/theme';

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/i;
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/i;

export default function PartnerRegistrationScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [photo, setPhoto] = useState<PickedFile | null>(null);
  const [panCard, setPanCard] = useState<PickedFile | null>(null);
  const [cancelledCheque, setCancelledCheque] = useState<PickedFile | null>(null);
  const [addressProof, setAddressProof] = useState<PickedFile | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!fullName.trim()) return 'Full name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email';
    if (!/^\d{10}$/.test(phone.replace(/\D/g, '').slice(-10))) return 'Enter a 10-digit phone number';
    if (!addressLine1.trim()) return 'Address is required';
    if (!city.trim() || !state.trim()) return 'City and state are required';
    if (!pinCode.trim()) return 'PIN code is required';
    if (!PAN_RE.test(panNumber.trim())) return 'Enter a valid PAN (e.g. ABCDE1234F)';
    if (!bankName.trim()) return 'Bank name is required';
    if (!accountNumber.trim()) return 'Account number is required';
    if (!branchAddress.trim()) return 'Branch address is required';
    if (!IFSC_RE.test(ifscCode.trim())) return 'Enter a valid IFSC code';
    if (!photo) return 'Profile photo is required';
    if (!panCard) return 'PAN card upload is required';
    if (!cancelledCheque) return 'Cancelled cheque scan is required';
    if (!addressProof) return 'Address proof document is required';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      Alert.alert('Check your details', err);
      return;
    }

    setLoading(true);
    try {
      const result = await partnerService.submitRegistration({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.replace(/\D/g, '').slice(-10),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        pinCode: pinCode.trim(),
        panNumber: panNumber.trim().toUpperCase(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        branchAddress: branchAddress.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        photo: photo!,
        panCard: panCard!,
        cancelledCheque: cancelledCheque!,
        addressProof: addressProof!,
      });
      Alert.alert(
        'Application submitted',
        result?.message ||
          'We will verify your documents and email you within 2–3 business days after approval.',
        [{ text: 'OK', onPress: () => router.replace('/(agent)/partner') }],
      );
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error ||
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not submit application. Try again.';
      Alert.alert('Submission failed', msg);
    }
    setLoading(false);
  };

  return (
    <Screen title="Become a Partner" showBack scroll>
      <Text style={styles.intro}>
        Complete this form with your personal, PAN, bank, and KYC details. Our super admin team will review your documents and activate your partner account.
      </Text>

      <Text style={styles.section}>Personal details</Text>
      <Input label="Full name" value={fullName} onChangeText={setFullName} />
      <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Input
        label="Phone (10 digits)"
        value={phone}
        onChangeText={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))}
        keyboardType="phone-pad"
        maxLength={10}
      />
      <Input label="Address line 1" value={addressLine1} onChangeText={setAddressLine1} />
      <Input label="Address line 2 (optional)" value={addressLine2} onChangeText={setAddressLine2} />
      <View style={styles.row}>
        <View style={styles.half}>
          <Input label="City" value={city} onChangeText={setCity} />
        </View>
        <View style={styles.half}>
          <Input label="State" value={state} onChangeText={setState} />
        </View>
      </View>
      <Input label="PIN code" value={pinCode} onChangeText={setPinCode} keyboardType="number-pad" maxLength={6} />
      <FilePicker label="Profile photo" onPick={setPhoto} uploadedName={photo?.name} acceptImages />

      <Text style={styles.section}>PAN & bank details</Text>
      <Input
        label="PAN number"
        value={panNumber}
        onChangeText={(v) => setPanNumber(v.toUpperCase().slice(0, 10))}
        autoCapitalize="characters"
        maxLength={10}
      />
      <FilePicker label="PAN card (scan/photo)" onPick={setPanCard} uploadedName={panCard?.name} />
      <Input label="Bank name" value={bankName} onChangeText={setBankName} />
      <Input label="Account number" value={accountNumber} onChangeText={setAccountNumber} keyboardType="number-pad" />
      <Input label="Branch address" value={branchAddress} onChangeText={setBranchAddress} />
      <Input
        label="IFSC code"
        value={ifscCode}
        onChangeText={(v) => setIfscCode(v.toUpperCase().slice(0, 11))}
        autoCapitalize="characters"
        maxLength={11}
      />

      <Text style={styles.section}>Documents</Text>
      <FilePicker
        label="Cancelled cheque (scan/photo)"
        onPick={setCancelledCheque}
        uploadedName={cancelledCheque?.name}
      />
      <FilePicker
        label="Address proof (Aadhaar, utility bill, etc.)"
        onPick={setAddressProof}
        uploadedName={addressProof?.name}
      />

      <Button title="Submit application" onPress={handleSubmit} loading={loading} variant="agent" style={{ marginTop: 8 }} />
      <Text style={styles.footer}>
        On approval you will receive an FY agent code, username, temporary password, and password reset instructions by email.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, color: colors.mutedForeground, lineHeight: 20, marginBottom: 16 },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  footer: { fontSize: 12, color: colors.mutedForeground, lineHeight: 17, marginTop: 16, marginBottom: 24 },
});
