import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/src/theme';
import { legalScreenHref } from '@/src/constants/legalPages';

type Props = {
  termsAccepted: boolean;
  contactConsentAccepted: boolean;
  onTermsChange: (value: boolean) => void;
  onContactConsentChange: (value: boolean) => void;
  disabled?: boolean;
};

function ConsentRow({
  checked,
  onChange,
  disabled,
  children,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, disabled && styles.disabled]}
      onPress={() => !disabled && onChange(!checked)}
      activeOpacity={0.7}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Text style={styles.check}>✓</Text> : null}
      </View>
      <View style={styles.textWrap}>{children}</View>
    </TouchableOpacity>
  );
}

function LegalLink({ label, slug }: { label: string; slug: string }) {
  return (
    <Text
      style={styles.link}
      onPress={() => router.push(legalScreenHref(slug) as never)}
    >
      {label}
    </Text>
  );
}

export default function ContactDataConsentBlock({
  termsAccepted,
  contactConsentAccepted,
  onTermsChange,
  onContactConsentChange,
  disabled = false,
}: Props) {
  return (
    <View style={styles.wrap}>
      <ConsentRow checked={termsAccepted} onChange={onTermsChange} disabled={disabled}>
        <Text style={styles.bodyText}>
          I have read and agree to the{' '}
          <LegalLink label="Terms of Service" slug="terms-of-service" />
          {' '}and{' '}
          <LegalLink label="Privacy Policy" slug="privacy-policy" />
          .
        </Text>
      </ConsentRow>

      <ConsentRow
        checked={contactConsentAccepted}
        onChange={onContactConsentChange}
        disabled={disabled}
      >
        <Text style={styles.bodyText}>
          I consent to Rfincare collecting my mobile number, email, and other information I provide
          through this app, and contacting me via call, SMS, WhatsApp, and email about loan products,
          application updates, and related services, as per the{' '}
          <LegalLink
            label="Consent for Data Collection & Credit Bureau Access"
            slug="consent-data-collection-credit-bureau"
          />
          .
        </Text>
      </ConsentRow>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    marginBottom: 12,
    gap: 12,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  disabled: { opacity: 0.5 },
  box: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  boxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  check: { color: '#fff', fontSize: 14, fontWeight: '700' },
  textWrap: { flex: 1 },
  bodyText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.foreground,
  },
  link: {
    color: colors.customer,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
