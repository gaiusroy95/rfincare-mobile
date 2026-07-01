import React, { useEffect, useState } from 'react';
import { Text, FlatList } from 'react-native';
import Screen from '@/src/components/Screen';
import Card from '@/src/components/Card';
import Button from '@/src/components/Button';
// @ts-expect-error JS module
import { agentService } from '@/src/services/agentService';

export default function AgentClientsScreen() {
  const [clients, setClients] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    agentService.getDashboard().then((d: { data?: { clients?: unknown[] }; clients?: unknown[] }) => {
      setClients(d?.data?.clients || d?.clients || []);
    });
  }, []);

  return (
    <Screen title="Client Pipeline">
      <FlatList
        data={clients}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Card>
            <Text style={{ fontWeight: '700' }}>{String(item.customerName || item.name)}</Text>
            <Text>Status: {String(item.status)}</Text>
            {['new', 'in_progress', 'documents_pending', 'submitted'].map((s) => (
              <Button key={s} title={`Set ${s}`} variant="outline" onPress={() => agentService.updateClientStatus(String(item.id), s)} style={{ marginTop: 4 }} />
            ))}
          </Card>
        )}
        ListEmptyComponent={<Text>No clients in pipeline.</Text>}
      />
    </Screen>
  );
}
