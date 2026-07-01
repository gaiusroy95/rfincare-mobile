import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/src/components/Card';
import { colors } from '@/src/theme';
import type { PerformanceAnalytics, PerformanceBucket } from '@/src/services/agentReportService';

const TIME_RANGES = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
] as const;

type TimeRange = (typeof TIME_RANGES)[number]['value'];

type Props = {
  analytics: PerformanceAnalytics | null;
  fallbackData?: PerformanceBucket[];
  compact?: boolean;
};

function pickChartData(
  analytics: PerformanceAnalytics | null,
  range: TimeRange,
  fallbackData?: PerformanceBucket[],
): PerformanceBucket[] {
  if (analytics?.[range]?.length) return analytics[range]!;
  if (range === 'month' && fallbackData?.length) return fallbackData;
  return analytics?.month || fallbackData || [];
}

function hasChartData(data: PerformanceBucket[]): boolean {
  return data.some(
    (row) => (row.clients || 0) > 0 || (row.conversions || 0) > 0 || (row.earnings || 0) > 0,
  );
}

export default function AgentPerformanceChart({ analytics, fallbackData, compact }: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const chartData = useMemo(
    () => pickChartData(analytics, timeRange, fallbackData),
    [analytics, timeRange, fallbackData],
  );

  const yMax = useMemo(() => {
    const peak = Math.max(
      0,
      ...chartData.map((row) =>
        Math.max(row.clients || 0, row.conversions || 0, (row.earnings || 0) / 1000),
      ),
    );
    return Math.max(4, Math.ceil(peak * 1.15));
  }, [chartData]);

  const scale = (value: number, isEarnings = false) => {
    const v = isEarnings ? value / 1000 : value;
    if (yMax <= 0) return 4;
    return Math.max(4, Math.round((v / yMax) * (compact ? 72 : 100)));
  };

  const totals = useMemo(
    () =>
      chartData.reduce(
        (acc, row) => ({
          clients: acc.clients + (row.clients || 0),
          conversions: acc.conversions + (row.conversions || 0),
          earnings: acc.earnings + (row.earnings || 0),
        }),
        { clients: 0, conversions: 0, earnings: 0 },
      ),
    [chartData],
  );

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="analytics" size={20} color={colors.agent} />
          <Text style={styles.title}>Performance Analytics</Text>
        </View>
        <View style={styles.controls}>
          <View style={styles.toggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, chartType === 'bar' && styles.toggleBtnActive]}
              onPress={() => setChartType('bar')}
            >
              <Ionicons name="bar-chart" size={14} color={chartType === 'bar' ? '#fff' : colors.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, chartType === 'line' && styles.toggleBtnActive]}
              onPress={() => setChartType('line')}
            >
              <Ionicons name="trending-up" size={14} color={chartType === 'line' ? '#fff' : colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rangeRow}>
        {TIME_RANGES.map((r) => (
          <TouchableOpacity
            key={r.value}
            style={[styles.rangeChip, timeRange === r.value && styles.rangeChipActive]}
            onPress={() => setTimeRange(r.value)}
          >
            <Text style={[styles.rangeText, timeRange === r.value && styles.rangeTextActive]}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {!hasChartData(chartData) ? (
        <View style={styles.empty}>
          <Ionicons name="bar-chart-outline" size={32} color={colors.mutedForeground} />
          <Text style={styles.emptyTitle}>No performance data yet</Text>
          <Text style={styles.emptyHint}>
            Add clients or submit applications — analytics update from your assigned applications.
          </Text>
        </View>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartScroll}>
            {chartData.map((bucket) => (
              <View key={bucket.name} style={styles.bucket}>
                <View style={styles.barGroup}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: scale(bucket.clients || 0),
                        backgroundColor: colors.primary,
                        opacity: chartType === 'line' ? 0.85 : 1,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      {
                        height: scale(bucket.conversions || 0),
                        backgroundColor: colors.success,
                        opacity: chartType === 'line' ? 0.85 : 1,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      {
                        height: scale(bucket.earnings || 0, true),
                        backgroundColor: colors.agent,
                        opacity: chartType === 'line' ? 0.85 : 1,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.bucketLabel} numberOfLines={1}>
                  {bucket.name}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.legend}>
            <LegendDot color={colors.primary} label="Clients" value={String(totals.clients)} />
            <LegendDot color={colors.success} label="Conversions" value={String(totals.conversions)} />
            <LegendDot
              color={colors.agent}
              label="Earnings"
              value={`₹${totals.earnings.toLocaleString('en-IN')}`}
            />
          </View>
          {compact ? null : (
            <Text style={styles.earningsNote}>Earnings bars scaled per ₹1,000 for chart readability.</Text>
          )}
        </>
      )}
    </Card>
  );
}

function LegendDot({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
      <Text style={styles.legendValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: '700', color: colors.foreground },
  controls: { flexDirection: 'row', alignItems: 'center' },
  toggle: { flexDirection: 'row', backgroundColor: colors.muted, borderRadius: 8, padding: 2 },
  toggleBtn: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6 },
  toggleBtnActive: { backgroundColor: colors.agent },
  rangeRow: { marginBottom: 12 },
  rangeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.muted,
    marginRight: 8,
  },
  rangeChipActive: { backgroundColor: colors.agent },
  rangeText: { fontSize: 12, color: colors.mutedForeground, fontWeight: '600' },
  rangeTextActive: { color: '#fff' },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.muted,
  },
  emptyTitle: { fontWeight: '600', color: colors.foreground, marginTop: 8 },
  emptyHint: { fontSize: 12, color: colors.mutedForeground, textAlign: 'center', marginTop: 4, paddingHorizontal: 16 },
  chartScroll: { paddingBottom: 4, minHeight: 120 },
  bucket: { alignItems: 'center', marginRight: 16, width: 56 },
  barGroup: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 100 },
  bar: { width: 12, borderRadius: 4, minHeight: 4 },
  bucketLabel: { fontSize: 10, color: colors.mutedForeground, marginTop: 6, textAlign: 'center' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11, color: colors.mutedForeground },
  legendValue: { fontSize: 11, fontWeight: '700', color: colors.foreground },
  earningsNote: { fontSize: 10, color: colors.mutedForeground, marginTop: 8 },
});
