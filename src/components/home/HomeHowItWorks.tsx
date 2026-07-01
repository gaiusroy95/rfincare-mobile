import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import SectionHeader from '@/src/components/home/SectionHeader';
import { colors } from '@/src/theme';

const STEPS = [
  { id: 1, icon: 'document-text' as const, color: colors.primary, titleKey: 'howItWorks.step1Title', descKey: 'howItWorks.step1Description', durationKey: 'howItWorks.step1Duration' },
  { id: 2, icon: 'business' as const, color: colors.secondary, titleKey: 'howItWorks.step2Title', descKey: 'howItWorks.step2Description', durationKey: 'howItWorks.step2Duration' },
  { id: 3, icon: 'send' as const, color: colors.accent, titleKey: 'howItWorks.step3Title', descKey: 'howItWorks.step3Description', durationKey: 'howItWorks.step3Duration' },
  { id: 4, icon: 'checkmark-circle' as const, color: colors.success, titleKey: 'howItWorks.step4Title', descKey: 'howItWorks.step4Description', durationKey: 'howItWorks.step4Duration' },
];

const FALLBACK = [
  { title: 'Check Eligibility', desc: 'Quick OTP verification and eligibility score', duration: '~2 min' },
  { title: 'Apply Online', desc: 'Complete the 8-step assessment wizard', duration: '~15 min' },
  { title: 'Compare & Choose', desc: 'Pick your preferred bank from marketplace', duration: '~5 min' },
  { title: 'Get Funded', desc: 'Track status in your dashboard', duration: '3–5 days' },
];

export default function HomeHowItWorks() {
  const { t } = useTranslation();

  return (
    <View>
      <SectionHeader
        title={t('howItWorks.title', 'How It Works')}
        subtitle={t('howItWorks.subtitle', 'Four simple steps from eligibility check to loan disbursement')}
      />
      <View style={styles.grid}>
        {STEPS.map((step, index) => (
          <View key={step.id} style={styles.card}>
            <View style={styles.iconRow}>
              <View style={[styles.iconCircle, { backgroundColor: step.color }]}>
                <Ionicons name={step.icon} size={24} color="#fff" />
              </View>
              <View style={[styles.stepBadge, { backgroundColor: step.color }]}>
                <Text style={styles.stepNum}>{step.id}</Text>
              </View>
            </View>
            <Text style={styles.title}>
              {t(step.titleKey, FALLBACK[index]?.title)}
            </Text>
            <Text style={styles.desc}>
              {t(step.descKey, FALLBACK[index]?.desc)}
            </Text>
            <View style={styles.duration}>
              <Ionicons name="time-outline" size={12} color={step.color} />
              <Text style={[styles.durationText, { color: step.color }]}>
                {t(step.durationKey, FALLBACK[index]?.duration)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 12 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  iconRow: { position: 'relative', alignSelf: 'flex-start', marginBottom: 12 },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  stepNum: { color: '#fff', fontSize: 12, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 6 },
  desc: { fontSize: 13, color: colors.mutedForeground, lineHeight: 18 },
  duration: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  durationText: { fontSize: 12, fontWeight: '600' },
});
