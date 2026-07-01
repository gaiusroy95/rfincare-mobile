import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/src/components/Button';
import BrandLogo from '@/src/components/BrandLogo';
import ContactDataConsentBlock from '@/src/components/ContactDataConsentBlock';
import { colors } from '@/src/theme';
import { APP_DISPLAY_NAME } from '@/src/constants/branding';
import { APP_CONSENT_VERSION } from '@/src/constants/appConsent';
import { saveAppConsent } from '@/src/utils/appConsent';

type Props = {
  onAccepted: () => void;
};

export default function AppInstallConsentScreen({ onAccepted }: Props) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [contactConsentAccepted, setContactConsentAccepted] = useState(false);
  const [saving, setSaving] = useState(false);

  const canContinue = termsAccepted && contactConsentAccepted;

  const handleAccept = async () => {
    if (!canContinue) return;
    setSaving(true);
    try {
      await saveAppConsent({
        version: APP_CONSENT_VERSION,
        termsAccepted: true,
        contactConsentAccepted: true,
      });
      onAccepted();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        <View style={styles.hero}>
          <BrandLogo size="lg" style={styles.logo} />
          <Text style={styles.title}>Welcome to {APP_DISPLAY_NAME}</Text>
          <Text style={styles.subtitle}>
            Before you continue, please review and accept our terms and consent for how we use your
            contact details when you use this app.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What you are agreeing to</Text>
          <Text style={styles.bullet}>• Use of the app under our Terms of Service and Privacy Policy</Text>
          <Text style={styles.bullet}>
            • Collection of mobile number, email, and other details you enter in the app
          </Text>
          <Text style={styles.bullet}>
            • Contact via call, SMS, WhatsApp, and email about loans, eligibility, and application updates
          </Text>
          <Text style={styles.bullet}>
            • OTP verification on your mobile and email where required for security
          </Text>
        </View>

        <ContactDataConsentBlock
          termsAccepted={termsAccepted}
          contactConsentAccepted={contactConsentAccepted}
          onTermsChange={setTermsAccepted}
          onContactConsentChange={setContactConsentAccepted}
        />

        <Button
          title={saving ? 'Saving…' : 'Accept & Continue'}
          onPress={handleAccept}
          variant="customer"
          disabled={!canContinue || saving}
          style={styles.cta}
        />

        <Text style={styles.footerNote}>
          You must accept both items above to use the {APP_DISPLAY_NAME} app. You can read the full policies
          anytime from Profile → Policies & Disclosures.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  hero: { alignItems: 'center', marginBottom: 20 },
  logo: { marginBottom: 8 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 10,
  },
  bullet: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.mutedForeground,
    marginBottom: 6,
  },
  cta: { marginTop: 8 },
  footerNote: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 18,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
});
