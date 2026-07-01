import React, { useEffect, useState } from 'react';
import { Text, FlatList, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Screen from '@/src/components/Screen';
import Card from '@/src/components/Card';
import Button from '@/src/components/Button';
import Input from '@/src/components/Input';
import { apiClient } from '@/src/api/apiClient';
// @ts-expect-error JS module
import { documentManagementService } from '@/src/services/documentManagementService';

export default function AgentDocumentCenterScreen() {
  const [apps, setApps] = useState<Record<string, unknown>[]>([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [docs, setDocs] = useState<Record<string, unknown>[]>([]);
  const [docType, setDocType] = useState('other');

  useEffect(() => {
    documentManagementService.getApplicationsWithDocuments({ search }).then((r: unknown) => setApps((r as { applications?: unknown[] })?.applications || [])).catch(() => {});
  }, [search]);

  useEffect(() => {
    if (!selectedId) return;
    Promise.resolve(documentManagementService.getDocumentsByApplication(selectedId))
      .then((r: { documents?: unknown[]; data?: unknown[] }) => setDocs(r?.documents || r?.data || (Array.isArray(r) ? r : [])))
      .catch(() => {});
  }, [selectedId]);

  const upload = async () => {
    const pick = await DocumentPicker.getDocumentAsync();
    if (pick.canceled || !selectedId) return;
    const file = pick.assets[0];
    const fd = new FormData();
    fd.append('file', { uri: file.uri, name: file.name, type: file.mimeType || 'application/octet-stream' } as unknown as Blob);
    fd.append('applicationId', selectedId);
    fd.append('documentType', docType);
    await apiClient.post('/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    documentManagementService.getDocumentsByApplication(selectedId).then((r: unknown) => setDocs((r as { documents?: unknown[] })?.documents || [])).catch(() => {});
  };

  if (selectedId) {
    return (
      <Screen title="Upload Documents">
        <TouchableOpacity onPress={() => setSelectedId('')}><Text style={{ color: '#2D4A87', marginBottom: 12 }}>← Back</Text></TouchableOpacity>
        <Input label="Document Type" value={docType} onChangeText={setDocType} />
        <Button title="Upload File" variant="agent" onPress={upload} />
        <FlatList data={docs} keyExtractor={(item) => String(item.id)} scrollEnabled={false} renderItem={({ item }) => (
          <Card><Text>{String(item.documentType)} — {String(item.status)}</Text></Card>
        )} />
      </Screen>
    );
  }

  return (
    <Screen title="Documents">
      <Input label="Search" value={search} onChangeText={setSearch} placeholder="Application number or mobile" />
      <FlatList data={apps} keyExtractor={(item) => String(item.id)} scrollEnabled={false} renderItem={({ item }) => (
        <Card><TouchableOpacity onPress={() => setSelectedId(String(item.id))}>
          <Text style={{ fontWeight: '700' }}>{String(item.applicationNumber || item.id)}</Text>
        </TouchableOpacity></Card>
      )} ListEmptyComponent={<Text>No applications.</Text>} />
    </Screen>
  );
}
