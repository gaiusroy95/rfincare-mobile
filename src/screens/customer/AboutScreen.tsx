import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@/src/components/Screen';
import CustomerHeaderActions from '@/src/components/customer/CustomerHeaderActions';
import { colors } from '@/src/theme';
// @ts-expect-error JS module
import { homepageService } from '@/src/services/homepageService';

type Stat = { id?: string; value?: string; label?: string };
type ValueItem = { id?: string; icon?: string; title?: string; description?: string };

type AboutContent = {
  heroTitle?: string;
  heroSubtitle?: string;
  stats?: Stat[];
  values?: ValueItem[];
  storyHeading?: string;
  storyParagraphs?: string[];
};

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  Target: 'flag-outline',
  Eye: 'eye-outline',
  Heart: 'heart-outline',
  Shield: 'shield-checkmark-outline',
};

export default function AboutScreen() {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    homepageService
      .getAboutContent()
      .then((data: AboutContent) => {
        if (!cancelled) setContent(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Screen title="About Us" showBack headerRight={<CustomerHeaderActions />} scroll={false}>
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      </Screen>
    );
  }

  const stats = content?.stats || [];
  const values = content?.values || [];
  const paragraphs = content?.storyParagraphs || [];

  return (
    <Screen title="About Us" showBack headerRight={<CustomerHeaderActions />}>
      <Text style={styles.heroTitle}>{content?.heroTitle || 'About Rfincare'}</Text>
      {content?.heroSubtitle ? <Text style={styles.heroSubtitle}>{content.heroSubtitle}</Text> : null}

      {stats.length ? (
        <View style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <View key={stat.id || i} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {values.length ? (
        <View style={styles.valuesWrap}>
          {values.map((value, i) => (
            <View key={value.id || i} style={styles.valueCard}>
              <View style={styles.valueIcon}>
                <Ionicons
                  name={ICON_MAP[value.icon || ''] || 'ellipse-outline'}
                  size={20}
                  color={colors.customer}
                />
              </View>
              <View style={styles.valueText}>
                <Text style={styles.valueTitle}>{value.title}</Text>
                {value.description ? <Text style={styles.valueDesc}>{value.description}</Text> : null}
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {paragraphs.length ? (
        <View style={styles.storyWrap}>
          <Text style={styles.storyHeading}>{content?.storyHeading || 'Our Story'}</Text>
          {paragraphs.map((para, i) => (
            <Text key={i} style={styles.storyParagraph}>
              {para}
            </Text>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: 48 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: colors.foreground, marginBottom: 8 },
  heroSubtitle: { fontSize: 15, color: colors.mutedForeground, lineHeight: 22, marginBottom: 20 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.customer },
  statLabel: { fontSize: 12, color: colors.mutedForeground, marginTop: 4, textAlign: 'center' },
  valuesWrap: { gap: 12, marginBottom: 24 },
  valueCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  valueIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.customer}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: { flex: 1 },
  valueTitle: { fontSize: 15, fontWeight: '700', color: colors.foreground },
  valueDesc: { fontSize: 13, color: colors.mutedForeground, marginTop: 4, lineHeight: 19 },
  storyWrap: { marginBottom: 16 },
  storyHeading: { fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 12 },
  storyParagraph: { fontSize: 14, color: colors.mutedForeground, lineHeight: 22, marginBottom: 12 },
});
