import React, { useEffect, useState, useCallback } from 'react';

import { View, Text, StyleSheet, FlatList, Modal, TouchableOpacity } from 'react-native';

import { router } from 'expo-router';

import * as DocumentPicker from 'expo-document-picker';

import Screen from '@/src/components/Screen';

import CustomerHeaderActions from '@/src/components/customer/CustomerHeaderActions';

import Card from '@/src/components/Card';

import Button from '@/src/components/Button';

import Input from '@/src/components/Input';

import StatusBadge from '@/src/components/StatusBadge';

import EmptyState from '@/src/components/EmptyState';

import { useAuth } from '@/src/contexts/AuthContext';

import { colors } from '@/src/theme';

import { apiClient } from '@/src/api/apiClient';

import { downloadApplicationPdf } from '@/src/utils/pdfDownload';

// @ts-expect-error JS module

import { customerJourneyService } from '@/src/services/customerJourneyService';



const TABS = ['Overview', 'Applications', 'Documents', 'Notifications'];



export default function CustomerDashboardScreen() {

  const { user, signOut } = useAuth();

  const [tab, setTab] = useState(0);

  const [apps, setApps] = useState<Record<string, unknown>[]>([]);

  const [docs, setDocs] = useState<Record<string, unknown>[]>([]);

  const [notifications, setNotifications] = useState<Record<string, unknown>[]>([]);

  const [selectedApp, setSelectedApp] = useState<Record<string, unknown> | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);

  const [docType, setDocType] = useState('other');

  const [loading, setLoading] = useState(true);



  const refresh = useCallback(async () => {

    if (!user) { setLoading(false); return; }

    try {

      const [a, d, n] = await Promise.all([

        customerJourneyService.getApplications(),

        customerJourneyService.getMyDocuments(),

        apiClient.get('/notifications/me'),

      ]);

      setApps(a?.data || a || []);

      setDocs(d?.data || d || []);

      setNotifications(n.data?.notifications || n.data || []);

    } catch { /* */ }

    setLoading(false);

  }, [user]);



  useEffect(() => {

    refresh();

    const id = setInterval(refresh, 30000);

    return () => clearInterval(id);

  }, [refresh]);



  const markRead = async (id: string) => {

    await apiClient.patch(`/notifications/${id}/read`);

    refresh();

  };



  const uploadDoc = async () => {

    const pick = await DocumentPicker.getDocumentAsync();

    if (pick.canceled) return;

    const file = pick.assets[0];

    const fd = new FormData();

    fd.append('file', { uri: file.uri, name: file.name, type: file.mimeType || 'application/octet-stream' } as unknown as Blob);

    fd.append('documentType', docType);

    await apiClient.post('/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

    setUploadOpen(false);

    refresh();

  };



  const getActionForApp = (app: Record<string, unknown>) => {

    const status = String(app.status || '');

    if (status === 'documents_pending') return { label: 'Upload Documents', href: '/(customer)/documents' };

    if (status === 'questionnaire_pending') return { label: 'Complete Questionnaire', href: '/(customer)/questionnaire' };

    if (status === 'bank_selection_pending') return { label: 'Select Bank', href: '/(customer)/bank-selection' };

    return null;

  };



  if (!user) {

    return (

      <Screen title="Dashboard" headerRight={<CustomerHeaderActions />}>

        <EmptyState title="Sign in required" message="Please sign in to view your dashboard." actionLabel="Customer Login" onAction={() => router.push('/(customer)/login')} />

      </Screen>

    );

  }



  return (

    <Screen title="My Dashboard" loading={loading} headerRight={<CustomerHeaderActions />}>

      <View style={styles.tabs}>

        {TABS.map((t, i) => (

          <TouchableOpacity key={t} onPress={() => setTab(i)} style={[styles.tab, tab === i && styles.tabActive]}>

            <Text style={[styles.tabText, tab === i && styles.tabTextActive]}>{t}</Text>

          </TouchableOpacity>

        ))}

      </View>



      {tab === 0 && (

        <>

          <Card>

            <Text style={styles.welcome}>Welcome, {user.firstName || user.email}</Text>

            <Button title="Edit Profile" variant="outline" onPress={() => router.push('/(customer)/profile')} style={{ marginTop: 8 }} />

            <Button title="New Application" variant="customer" onPress={() => router.push('/(customer)/assessment')} style={{ marginTop: 8 }} />

            <Button title="Resume Draft" variant="outline" onPress={() => router.push({ pathname: '/(customer)/assessment', params: { resume: '1' } })} style={{ marginTop: 8 }} />

            <Button title="Sign Out" variant="ghost" onPress={async () => { await signOut(); router.replace('/'); }} style={{ marginTop: 8 }} />

          </Card>

          <Text style={styles.section}>Active Applications</Text>

          {apps.slice(0, 2).map((app) => {

            const action = getActionForApp(app);

            return (

              <Card key={String(app.id)}>

                <View style={styles.appRow}>

                  <Text style={styles.appNum}>{String(app.applicationNumber || app.id)}</Text>

                  <StatusBadge status={String(app.status || 'pending')} />

                </View>

                {action && <Button title={action.label} variant="customer" onPress={() => router.push(action.href as never)} style={{ marginTop: 8 }} />}

              </Card>

            );

          })}

          <Text style={styles.section}>Recent Documents ({docs.length})</Text>

          {docs.slice(0, 4).map((d) => (

            <Card key={String(d.id)}><Text>{String(d.documentType || d.type)}</Text></Card>

          ))}

        </>

      )}



      {tab === 1 && (

        <FlatList

          data={apps}

          keyExtractor={(item) => String(item.id)}

          scrollEnabled={false}

          ListEmptyComponent={<EmptyState title="No applications" message="Start a new application to see it here." actionLabel="Apply Now" onAction={() => router.push('/(customer)/assessment')} />}

          renderItem={({ item }) => (

            <Card>

              <TouchableOpacity onPress={() => setSelectedApp(item)}>

                <View style={styles.appRow}>

                  <Text style={styles.appNum}>{String(item.applicationNumber || item.id)}</Text>

                  <StatusBadge status={String(item.status)} />

                </View>

                <Text style={styles.meta}>Updated: {String(item.updatedAt || item.createdAt || '')}</Text>

              </TouchableOpacity>

            </Card>

          )}

        />

      )}



      {tab === 2 && (

        <>

          <Button title="Upload Document" variant="customer" onPress={() => setUploadOpen(true)} />

          <FlatList data={docs} keyExtractor={(item) => String(item.id)} scrollEnabled={false}

            ListEmptyComponent={<Text>No documents.</Text>}

            renderItem={({ item }) => (

              <Card>

                <Text>{String(item.documentType || item.type)}</Text>

                <Text style={styles.meta}>Status: {String(item.status || 'uploaded')}</Text>

              </Card>

            )}

          />

        </>

      )}



      {tab === 3 && (

        <FlatList data={notifications} keyExtractor={(item) => String(item.id)} scrollEnabled={false}

          ListEmptyComponent={<Text>No notifications.</Text>}

          renderItem={({ item }) => (

            <Card>

              <TouchableOpacity onPress={() => markRead(String(item.id))}>

                <Text style={!item.read ? styles.unread : undefined}>{String(item.title || item.message)}</Text>

                <Text style={styles.meta}>{String(item.createdAt || '')}</Text>

              </TouchableOpacity>

            </Card>

          )}

        />

      )}



      <Modal visible={!!selectedApp} transparent animationType="slide">

        <View style={styles.modalBg}>

          <View style={styles.modal}>

            <Text style={styles.modalTitle}>Application Details</Text>

            {selectedApp && (

              <>

                <Text>Number: {String(selectedApp.applicationNumber)}</Text>

                <StatusBadge status={String(selectedApp.status)} />

                <Button title="Download PDF Summary" variant="outline" onPress={() => downloadApplicationPdf(String(selectedApp.id))} style={{ marginTop: 8 }} />

              </>

            )}

            <Button title="Close" onPress={() => setSelectedApp(null)} style={{ marginTop: 12 }} />

          </View>

        </View>

      </Modal>



      <Modal visible={uploadOpen} transparent animationType="slide">

        <View style={styles.modalBg}>

          <View style={styles.modal}>

            <Input label="Document Type" value={docType} onChangeText={setDocType} />

            <Button title="Pick & Upload" onPress={uploadDoc} variant="customer" />

            <Button title="Cancel" variant="ghost" onPress={() => setUploadOpen(false)} style={{ marginTop: 8 }} />

          </View>

        </View>

      </Modal>

    </Screen>

  );

}



const styles = StyleSheet.create({

  tabs: { flexDirection: 'row', marginBottom: 12 },

  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: colors.border },

  tabActive: { borderBottomColor: colors.customer },

  tabText: { fontSize: 11, color: colors.mutedForeground },

  tabTextActive: { color: colors.customer, fontWeight: '600' },

  welcome: { fontSize: 16, fontWeight: '600' },

  section: { marginTop: 12, fontWeight: '600', marginBottom: 8 },

  appRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  appNum: { fontWeight: '700', fontSize: 15 },

  meta: { fontSize: 12, color: colors.mutedForeground, marginTop: 4 },

  unread: { fontWeight: '700' },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },

  modal: { backgroundColor: colors.card, borderRadius: 16, padding: 20 },

  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },

});


