import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BankLogo from '@/src/components/BankLogo';
import SectionHeader from '@/src/components/home/SectionHeader';
import { colors } from '@/src/theme';
import { getBankLogoUrl } from '@/src/utils/bankBranding';

const STAT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  FileCheck: 'document-text',
  TrendingUp: 'trending-up',
  Clock: 'time',
  Star: 'star',
};

const DEFAULT_STATS = [
  { id: 'applications', value: '50,000+', label: 'Applications Processed', icon: 'FileCheck', color: colors.primary },
  { id: 'approval', value: '87%', label: 'Average Approval Rate', icon: 'TrendingUp', color: colors.success },
  { id: 'processing', value: '48 Hours', label: 'Avg. Processing Time', icon: 'Clock', color: colors.secondary },
  { id: 'satisfaction', value: '4.8/5', label: 'Customer Satisfaction', icon: 'Star', color: colors.warning },
];

type Stat = { id?: string; value: string; label: string; icon?: string; color?: string };
type Bank = Record<string, unknown>;

type Props = {
  heading?: string;
  subtitle?: string;
  stats?: Stat[];
  banks: Bank[];
};

export default function HomeTrustSection({ heading, subtitle, stats, banks }: Props) {
  const displayStats = stats?.length ? stats : DEFAULT_STATS;
  const partners = banks.slice(0, 6);

  return (
    <View>
      <SectionHeader
        title={heading || 'Trusted by Thousands'}
        subtitle={subtitle || 'Security, transparency, and partner banks you can rely on.'}
      />

      <View style={styles.statsGrid}>
        {displayStats.slice(0, 4).map((stat) => {
          const iconName = STAT_ICONS[stat.icon || ''] || 'shield-checkmark';
          const tint = stat.color || colors.primary;
          return (
            <View key={stat.id || stat.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${tint}18` }]}>
                <Ionicons name={iconName} size={20} color={tint} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel} numberOfLines={2}>{stat.label}</Text>
            </View>
          );
        })}
      </View>

      {partners.length > 0 ? (
        <>
          <Text style={styles.partnersTitle}>Our Banking Partners</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.partnerRow}>
            {partners.map((bank) => {
              const logo = getBankLogoUrl(bank);
              const name = String(bank.name || 'Bank');
              return (
                <View key={String(bank.id)} style={styles.partnerCard}>
                  <BankLogo
                    uri={logo}
                    size={40}
                    style={styles.logoBox}
                    backgroundColor={colors.muted}
                  />
                  <Text style={styles.partnerName} numberOfLines={2}>{name}</Text>
                </View>
              );
            })}
          </ScrollView>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  statLabel: { fontSize: 11, color: colors.mutedForeground, textAlign: 'center', marginTop: 4 },
  partnersTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, marginTop: 20, marginBottom: 10 },
  partnerRow: { gap: 10, paddingRight: 4 },
  partnerCard: {
    width: 110,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    alignItems: 'center',
  },
  logoBox: {
    width: 72,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.muted,
    borderRadius: 8,
    marginBottom: 8,
  },
  partnerName: { fontSize: 11, fontWeight: '600', color: colors.foreground, textAlign: 'center' },
});
