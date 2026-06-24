import React from 'react';
import { TextInput, Text, View, StyleSheet, TextInputProps } from 'react-native';
import { colors, radii } from '@/src/theme';

type Props = TextInputProps & {
  label?: string;
  error?: string;
};

const PLACEHOLDERS: Record<string, string> = {
  email: 'name@example.com',
  'new email': 'name@example.com',
  password: 'Enter your password',
  'current password': 'Enter current password',
  'new password': 'Enter new password',
  'confirm password': 'Re-enter new password',
  otp: 'Enter 6-digit OTP',
  phone: '10-digit mobile number',
  mobile: '10-digit mobile number',
  'phone (10 digits)': '10-digit mobile number',
  'mobile (10 digits)': '10-digit mobile number',
  'email or phone': 'Email or 10-digit mobile',
  'first name': 'Enter first name',
  'last name': 'Enter last name',
  'full name': 'Enter full name',
  name: 'Enter your name',
  aadhaar: '12-digit Aadhaar number',
  pan: 'e.g. ABCDE1234F',
  address: 'House no., street, area',
  city: 'Enter city',
  district: 'Enter district',
  state: 'Enter state',
  'pin code': '6-digit PIN code',
  'date of birth': 'YYYY-MM-DD',
  gender: 'Male / Female / Other',
  'employment type': 'Salaried / Self-employed',
  employment: 'Salaried / Self-employed',
  employer: 'Company or business name',
  'employer name': 'Company or business name',
  'monthly income': 'Monthly income in ₹',
  'monthly income (₹)': 'Monthly income in ₹',
  'annual income': 'Annual income in ₹',
  'annual income (₹)': 'Annual income in ₹',
  'loan amount': 'Amount in ₹',
  'loan amount (₹)': 'Amount in ₹',
  'loan purpose': 'e.g. Home renovation',
  'loan type': 'e.g. personal_loan',
  'credit score': 'e.g. 750',
  'preferred bank id': 'Bank ID (optional)',
  'bank name': 'Enter bank name',
  'account name': 'Name as per bank account',
  'account number': 'Bank account number',
  ifsc: 'e.g. HDFC0001234',
  'application number': 'e.g. RF123456',
  subject: 'What is this about?',
  message: 'Type your message here',
  'your story': 'Share your loan success story',
  details: 'Provide additional details',
  search: 'Search...',
  'document type': 'e.g. pan, aadhaar',
  'avatar url': 'https://example.com/photo.jpg',
  'annual interest rate (%)': 'e.g. 10.5',
  'tenure (months)': 'e.g. 60',
  'type deactivate + otp': 'DEACTIVATE 123456',
};

function normalizeLabel(label: string) {
  return label.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

function getDefaultPlaceholder(
  label: string | undefined,
  { secureTextEntry, multiline, editable }: Pick<TextInputProps, 'secureTextEntry' | 'multiline' | 'editable'>,
): string | undefined {
  if (!label || editable === false) return undefined;
  if (secureTextEntry) return 'Enter your password';

  const key = normalizeLabel(label);
  if (PLACEHOLDERS[key]) return PLACEHOLDERS[key];

  if (multiline) return `Enter ${key}`;
  return `Enter ${key}`;
}

export default function Input({ label, error, style, placeholder, editable, secureTextEntry, multiline, ...props }: Props) {
  const resolvedPlaceholder =
    placeholder ?? getDefaultPlaceholder(label, { secureTextEntry, multiline, editable });

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholder={resolvedPlaceholder}
        placeholderTextColor={colors.mutedForeground}
        editable={editable}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        style={[styles.input, error && styles.inputError, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '500', color: colors.foreground, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.foreground,
    backgroundColor: colors.card,
  },
  inputError: { borderColor: colors.destructive },
  error: { color: colors.destructive, fontSize: 12, marginTop: 4 },
});
