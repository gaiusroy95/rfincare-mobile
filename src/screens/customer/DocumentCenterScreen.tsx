import React, { useEffect, useState } from 'react';
import { Text, FlatList, TouchableOpacity } from 'react-native';
import Screen from '@/src/components/Screen';
import Card from '@/src/components/Card';
import Input from '@/src/components/Input';
// @ts-expect-error JS module
import { documentManagementService } from '@/src/services/documentManagementService';

export default function DocumentCenterScreen() {
  const [apps, setApps] = useState<Record<string, unknown>[]>([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [docs, setDocs] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    documentManagementService.getApplicationsWithDocuments({ search }).then((r: unknown) => setApps((r as { applications?: unknown[] })?.applications || (r as unknown[]) || [])).catch(() => {});
  }, [search]);

  useEffect(() => {
    if (!selectedId) return;
    documentManagementService.getDocumentsByApplication(selectedId).then((r: unknown) => setDocs((r as { documents?: unknown[] })?.documents || (r as unknown[]) || [])).catch(() => {});
  }, [selectedId]);

  if (selectedId) {
    return (
      <Screen title="Application Documents">
        <ButtonBack onPress={() => setSelectedId('')} />
        <FlatList
          data={docs}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Card>
              <Text>{String(item.documentType)} — {String(item.status)}</Text>
            </Card>
          )}
          ListEmptyComponent={<Text>No documents.</Text>}
        />
      </Screen>
    );
  }

  return (
    <Screen title="Document Center">
      <Input label="Search" value={search} onChangeText={setSearch} placeholder="App number, name, mobile..." />
      <FlatList
        data={apps}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Card>
            <TouchableOpacity onPress={() => setSelectedId(String(item.id))}>
              <Text style={{ fontWeight: '700' }}>{String(item.applicationNumber || item.id)}</Text>
              <Text>{String(item.customerName || item.applicantName || '')}</Text>
            </TouchableOpacity>
          </Card>
        )}
        ListEmptyComponent={<Text>No applications found.</Text>}
      />
    </Screen>
  );
}

function ButtonBack({ onPress }: { onPress: () => void }) {
  return <TouchableOpacity onPress={onPress} style={{ marginBottom: 12 }}><Text style={{ color: '#2D4A87', fontWeight: '600' }}>← Back to list</Text></TouchableOpacity>;
}
