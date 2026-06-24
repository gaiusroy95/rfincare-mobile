import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/src/components/Button';
import { colors } from '@/src/theme';
import type { LearningResource } from '@/src/utils/learningResourcesMobile';

const TYPE_COLORS: Record<string, { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }> = {
  video: { bg: '#EDE9FE', text: '#6D28D9', icon: 'videocam' },
  document: { bg: '#D1FAE5', text: '#047857', icon: 'document-text' },
  course: { bg: '#DBEAFE', text: '#1D4ED8', icon: 'school' },
  webinar: { bg: '#FEF3C7', text: '#B45309', icon: 'desktop' },
  certification: { bg: '#FEE2E2', text: '#B91C1C', icon: 'ribbon' },
};

function progressColor(progress: number): string {
  if (progress >= 75) return colors.success;
  if (progress >= 50) return colors.warning;
  if (progress >= 25) return colors.primary;
  return colors.border;
}

type Props = {
  resource: LearningResource;
  onOpen: () => void;
  loading?: boolean;
  active?: boolean;
};

export default function TrainingResourceCard({ resource, onOpen, loading, active }: Props) {
  const meta = TYPE_COLORS[resource.type] || { bg: colors.muted, text: colors.mutedForeground, icon: 'book' as const };
  const progress = resource.progress ?? 0;
  const actionLabel = progress >= 100 ? 'Review' : progress > 0 ? 'Continue' : 'Start';

  return (
    <View style={[styles.card, active && styles.cardActive]}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon} size={22} color={meta.text} />
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>{resource.title}</Text>
            {resource.isNew ? <Text style={styles.badge}>New</Text> : null}
          </View>
          {resource.description ? (
            <Text style={styles.desc} numberOfLines={2}>{resource.description}</Text>
          ) : null}

          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressValue}>{progress}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(100, progress)}%`, backgroundColor: progressColor(progress) }]} />
          </View>

          <View style={styles.footer}>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={14} color={colors.mutedForeground} />
              <Text style={styles.duration}>{resource.duration}</Text>
              <Text style={styles.typeLabel}>{resource.type}</Text>
            </View>
            <Button
              title={actionLabel}
              variant={progress > 0 ? 'outline' : 'agent'}
              onPress={onOpen}
              loading={loading}
              style={styles.btn}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.muted,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardActive: { borderColor: colors.agent, borderWidth: 2 },
  row: { flexDirection: 'row', gap: 12 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 },
  title: { flex: 1, fontWeight: '700', fontSize: 14, color: colors.foreground },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  desc: { fontSize: 12, color: colors.mutedForeground, marginBottom: 8 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressLabel: { fontSize: 11, color: colors.mutedForeground },
  progressValue: { fontSize: 11, fontWeight: '700', color: colors.foreground },
  progressTrack: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  duration: { fontSize: 11, color: colors.mutedForeground },
  typeLabel: { fontSize: 11, color: colors.mutedForeground, textTransform: 'capitalize', marginLeft: 4 },
  btn: { minWidth: 88, paddingHorizontal: 12 },
});
