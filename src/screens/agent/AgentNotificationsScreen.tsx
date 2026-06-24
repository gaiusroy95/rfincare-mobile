import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@/src/components/Screen';
import { colors } from '@/src/theme';
import { notificationService } from '@/src/services/notificationService';

type NotificationItem = {
  id: string;
  title?: string;
  message?: string;
  isRead?: boolean;
  createdAt?: string;
  applicationId?: string;
};

export default function AgentNotificationsScreen() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await notificationService.getStaffNotifications();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const markRead = async (id: string) => {
    await notificationService.markStaffRead(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  return (
    <Screen title="Notifications" showBack loading={loading} scroll={false}>
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-outline" size={40} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptyHint}>Application and client updates from the portal will appear here.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.isRead && styles.unread]}
            onPress={() => markRead(item.id)}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{item.title || 'Update'}</Text>
              {!item.isRead ? <View style={styles.dot} /> : null}
            </View>
            <Text style={styles.message}>{item.message}</Text>
            {item.createdAt ? (
              <Text style={styles.time}>{new Date(item.createdAt).toLocaleString('en-IN')}</Text>
            ) : null}
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 },
  emptyText: { fontSize: 16, fontWeight: '700', color: colors.foreground, marginTop: 12 },
  emptyHint: { fontSize: 13, color: colors.mutedForeground, textAlign: 'center', marginTop: 8, lineHeight: 18 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  unread: { borderColor: colors.agent, backgroundColor: `${colors.agent}08` },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { fontSize: 15, fontWeight: '700', color: colors.foreground, flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.agent },
  message: { fontSize: 13, color: colors.mutedForeground, marginTop: 8, lineHeight: 18 },
  time: { fontSize: 11, color: colors.mutedForeground, marginTop: 8 },
});
