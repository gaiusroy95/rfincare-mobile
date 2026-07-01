import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@/src/components/Screen';
import Card from '@/src/components/Card';
import Button from '@/src/components/Button';
import Input from '@/src/components/Input';
import StatusBadge from '@/src/components/StatusBadge';
import AgentPerformanceChart from '@/src/components/agent/AgentPerformanceChart';
import CommissionReportPanel from '@/src/components/agent/CommissionReportPanel';
import { colors } from '@/src/theme';
import { agentService } from '@/src/services/agentService';
import { creditCardService, type CreditCard } from '@/src/services/creditCardService';
import { staffMessagingService } from '@/src/services/staffMessagingService';
import type { PerformanceAnalytics } from '@/src/services/agentReportService';

const TABS = ['Overview', 'Pipeline', 'Performance'];
const PIPELINE_STAGES = ['new', 'in_progress', 'documents_pending', 'submitted', 'approved'];

type DashboardMetric = {
  type?: string;
  value?: string;
  label?: string;
  subtitle?: string;
  trend?: string;
  change?: string;
};

function metricValue(metrics: unknown, type: string, fallback = '—'): string {
  if (!Array.isArray(metrics)) return fallback;
  const row = (metrics as DashboardMetric[]).find((m) => m.type === type);
  return row?.value != null ? String(row.value) : fallback;
}

export default function AgentDashboardScreen() {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState<Record<string, unknown>>({});
  const [helpOpen, setHelpOpen] = useState(false);
  const [messages, setMessages] = useState<Record<string, unknown>[]>([]);
  const [msgText, setMsgText] = useState('');
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<Record<string, unknown>[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);

  const refresh = useCallback(async () => {
    try {
      const dash = await agentService.getDashboard();
      const payload = (dash?.data || dash || {}) as Record<string, unknown>;
      setData(payload);
      setActivity(
        (payload.recentActivities || payload.recentActivity || []) as Record<string, unknown>[],
      );
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 20000);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    creditCardService.listActive().then((list) => {
      setCreditCards(Array.isArray(list) ? list.slice(0, 4) : []);
    }).catch(() => setCreditCards([]));
  }, []);

  useEffect(() => {
    if (!helpOpen) return;
    const load = () =>
      staffMessagingService
        .getMessages()
        .then((r: { data?: unknown[] }) => setMessages((r?.data || r || []) as Record<string, unknown>[]))
        .catch(() => {});
    load();
    const id = setInterval(load, 12000);
    return () => clearInterval(id);
  }, [helpOpen]);

  const metrics = data.metrics;
  const clients = (data.clients || []) as Record<string, unknown>[];
  const commissions = (data.commissionEntries || []) as Record<string, unknown>[];
  const summary = (data.commissionSummary || {}) as Record<string, unknown>;
  const performanceAnalytics = (data.performanceAnalytics || null) as PerformanceAnalytics | null;
  const weeklyPerformance = (data.weeklyPerformance || []) as PerformanceAnalytics['month'];

  const clientsByStage = PIPELINE_STAGES.map((stage) => ({
    stage,
    items: clients.filter((c) => String(c.status || 'new') === stage),
  }));

  const statCards = useMemo(
    () => [
      { label: 'Clients', value: metricValue(metrics, 'customers', '0') },
      { label: 'Conversion', value: metricValue(metrics, 'conversions', '—%') },
      { label: 'Commission', value: metricValue(metrics, 'earnings', '₹—') },
    ],
    [metrics],
  );

  const sendMessage = async () => {
    await staffMessagingService.sendMessage({ body: msgText, channel: 'in_app' });
    setMsgText('');
    setHelpOpen(false);
  };

  const moveClient = async (clientId: string, status: string) => {
    await agentService.updateClientStatus(clientId, status);
    refresh();
  };

  return (
    <Screen
      title="Agent Dashboard"
      loading={loading}
      headerRight={(
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => router.push('/(agent)/notifications')}
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications-outline" size={22} color={colors.foreground} />
        </TouchableOpacity>
      )}
    >
      <View style={styles.tabs}>
        {TABS.map((t, i) => (
          <TouchableOpacity key={t} onPress={() => setTab(i)} style={[styles.tab, tab === i && styles.tabActive]}>
            <Text style={[styles.tabText, tab === i && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 0 && (
        <>
          <View style={styles.statsRow}>
            {statCards.map((s) => (
              <Card key={s.label} style={styles.statCard}>
                <Text style={styles.statVal}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </Card>
            ))}
          </View>

          <AgentPerformanceChart
            analytics={performanceAnalytics}
            fallbackData={weeklyPerformance}
            compact
          />

          <Button title="New Client Application" variant="agent" onPress={() => router.push('/(agent)/application')} />
          <Button
            title="View Clients"
            variant="outline"
            onPress={() => router.push('/(agent)/(tabs)/clients')}
            style={{ marginTop: 8 }}
          />
          <Button
            title="Get Help / Messages"
            variant="outline"
            onPress={() => setHelpOpen(true)}
            style={{ marginTop: 8 }}
          />

          <Text style={styles.section}>Credit Cards</Text>
          <View style={styles.ccGrid}>
            {(creditCards.length ? creditCards : [{ id: 'browse', name: 'Browse cards', bankName: '' }]).map((card) => (
              <TouchableOpacity
                key={card.id}
                style={styles.ccTile}
                onPress={() => router.push('/(agent)/credit-cards')}
              >
                <Ionicons name="card-outline" size={22} color={colors.agent} />
                <Text style={styles.ccLabel} numberOfLines={2}>{card.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <CommissionReportPanel />

          <Text style={styles.section}>Recent Activity</Text>
          {activity.length === 0 ? (
            <Text style={styles.emptyHint}>No recent activity yet.</Text>
          ) : (
            activity.slice(0, 5).map((a, i) => (
              <Card key={i}>
                <Text>{String(a.description || a.message || a.type)}</Text>
              </Card>
            ))
          )}

          <Text style={styles.section}>Recent Commissions</Text>
          {commissions.length === 0 ? (
            <Text style={styles.emptyHint}>No commission entries yet.</Text>
          ) : (
            commissions.slice(0, 5).map((c, i) => (
              <Card key={i}>
                <Text>
                  ₹{String(c.amount)} — <StatusBadge status={String(c.status)} />
                </Text>
              </Card>
            ))
          )}
        </>
      )}

      {tab === 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator>
          {clientsByStage.map(({ stage, items }) => (
            <View key={stage} style={styles.kanbanCol}>
              <Text style={styles.kanbanTitle}>
                {stage.replace(/_/g, ' ')} ({items.length})
              </Text>
              {items.map((item) => (
                <Card key={String(item.id)} style={styles.kanbanCard}>
                  <Text style={styles.clientName}>{String(item.customerName || item.name)}</Text>
                  <StatusBadge status={String(item.status)} />
                  <View style={styles.moveRow}>
                    {PIPELINE_STAGES.filter((s) => s !== stage).map((s) => (
                      <TouchableOpacity
                        key={s}
                        onPress={() => moveClient(String(item.id), s)}
                        style={styles.moveBtn}
                      >
                        <Text style={styles.moveText}>{s.split('_')[0]}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Card>
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      {tab === 2 && (
        <>
          <AgentPerformanceChart
            analytics={performanceAnalytics}
            fallbackData={weeklyPerformance}
          />

          <Card>
            <Text style={styles.metric}>Commission Summary</Text>
            <Text style={styles.summaryLine}>Total Earned: ₹{String(summary.totalEarned ?? '—')}</Text>
            <Text style={styles.summaryLine}>Pending: ₹{String(summary.pending ?? '—')}</Text>
            <Text style={styles.summaryLine}>Paid entries: {commissions.filter((c) => c.status === 'paid').length}</Text>
          </Card>

          <CommissionReportPanel />
        </>
      )}

      <Modal visible={helpOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Staff Communication</Text>
            <FlatList
              data={messages}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => (
                <Text style={{ marginBottom: 8 }}>{String(item.body || item.message)}</Text>
              )}
              style={{ maxHeight: 200 }}
            />
            <Input label="Message" value={msgText} onChangeText={setMsgText} />
            <Button title="Send" onPress={sendMessage} variant="agent" />
            <Button title="Close" variant="ghost" onPress={() => setHelpOpen(false)} style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', marginBottom: 12 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: colors.border },
  tabActive: { borderBottomColor: colors.agent },
  tabText: { fontSize: 12, color: colors.mutedForeground },
  tabTextActive: { color: colors.agent, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statVal: { fontSize: 16, fontWeight: '700', color: colors.agent, textAlign: 'center' },
  statLabel: { fontSize: 11, color: colors.mutedForeground },
  metric: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  summaryLine: { fontSize: 14, color: colors.foreground, marginBottom: 4 },
  section: { fontWeight: '700', marginTop: 16, marginBottom: 8 },
  emptyHint: { fontSize: 13, color: colors.mutedForeground, marginBottom: 8 },
  clientName: { fontWeight: '700', marginBottom: 4 },
  kanbanCol: { width: 200, marginRight: 12 },
  kanbanTitle: { fontWeight: '700', textTransform: 'capitalize', marginBottom: 8 },
  kanbanCard: { marginBottom: 8 },
  moveRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 4 },
  moveBtn: { paddingHorizontal: 6, paddingVertical: 4, backgroundColor: colors.muted, borderRadius: 4 },
  moveText: { fontSize: 10, textTransform: 'capitalize' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: colors.card, borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ccGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  ccTile: {
    width: '47%',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 8,
  },
  ccLabel: { fontSize: 12, fontWeight: '600', color: colors.foreground, textAlign: 'center' },
});
