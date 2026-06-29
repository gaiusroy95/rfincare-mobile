import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme';

type ScoreInfo = {
  score: number | null;
  label: string;
  color: string;
  hasScore: boolean;
};

/** Map a self-reported credit-score range to a representative score + label. */
export function resolveCreditScore(range?: string | null): ScoreInfo {
  const key = String(range || '').toLowerCase();
  switch (key) {
    case 'excellent':
    case '750+':
      return { score: 785, label: 'Excellent', color: colors.success, hasScore: true };
    case 'good':
      return { score: 725, label: 'Good', color: colors.primary, hasScore: true };
    case 'fair':
      return { score: 675, label: 'Fair', color: colors.warning, hasScore: true };
    case 'poor':
    case 'very_poor':
      return { score: 600, label: 'Needs work', color: colors.destructive, hasScore: true };
    default:
      return { score: null, label: 'Not checked', color: colors.mutedForeground, hasScore: false };
  }
}

type Props = {
  range?: string | null;
  onViewReport?: () => void;
};

const SIZE = 132;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const MIN_SCORE = 300;
const MAX_SCORE = 900;

export default function CreditScoreCard({ range, onViewReport }: Props) {
  const info = resolveCreditScore(range);
  const fraction = info.score
    ? Math.min(1, Math.max(0, (info.score - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)))
    : 0;
  const dashOffset = CIRCUMFERENCE * (1 - fraction);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Credit Score</Text>
        <Ionicons name="ribbon-outline" size={20} color={colors.warning} />
      </View>

      <View style={styles.ringWrap}>
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={colors.muted}
            strokeWidth={STROKE}
            fill="none"
          />
          {info.hasScore ? (
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={info.color}
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          ) : null}
        </Svg>
        <View style={styles.ringCenter}>
          {info.hasScore ? (
            <>
              <Text style={styles.scoreValue}>{info.score}</Text>
              <Text style={[styles.scoreLabel, { color: info.color }]}>{info.label.toUpperCase()}</Text>
            </>
          ) : (
            <>
              <Ionicons name="help-circle-outline" size={28} color={colors.mutedForeground} />
              <Text style={styles.noScore}>No score yet</Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.footerNote}>
          {info.hasScore ? 'Based on your latest application' : 'Check your eligibility to estimate'}
        </Text>
        <Text style={styles.link} onPress={onViewReport}>
          {info.hasScore ? 'View Report' : 'Check now'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 12,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: colors.foreground },
  ringWrap: { alignItems: 'center', justifyContent: 'center', marginVertical: 14 },
  ringCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  scoreValue: { fontSize: 34, fontWeight: '800', color: colors.foreground },
  scoreLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  noScore: { fontSize: 12, color: colors.mutedForeground, marginTop: 4 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  footerNote: { fontSize: 12, color: colors.mutedForeground, flex: 1 },
  link: { fontSize: 13, fontWeight: '700', color: colors.customer },
});
