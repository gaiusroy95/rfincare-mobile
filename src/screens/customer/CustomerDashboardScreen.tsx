import React, { useEffect, useState, useCallback } from 'react';

import { View, Text, StyleSheet, FlatList, Modal, TouchableOpacity, Alert, Linking, Image } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { router } from 'expo-router';

import Screen from '@/src/components/Screen';

import CustomerHeaderActions from '@/src/components/customer/CustomerHeaderActions';

import Card from '@/src/components/Card';

import Button from '@/src/components/Button';

import Select from '@/src/components/Select';

import StatusBadge from '@/src/components/StatusBadge';

import { pickDocument, type PickedFile } from '@/src/components/FilePicker';

import EmptyState from '@/src/components/EmptyState';

import { useAuth } from '@/src/contexts/AuthContext';

import { colors } from '@/src/theme';

import { apiClient } from '@/src/api/apiClient';

import { downloadApplicationPdf } from '@/src/utils/pdfDownload';

import DocumentPreviewModal from '@/src/components/DocumentPreviewModal';

// @ts-expect-error JS module
import { documentTypeLabel } from '@/src/utils/documentUrls';

// @ts-expect-error JS module

import { customerJourneyService } from '@/src/services/customerJourneyService';

// @ts-expect-error JS module

import { bankService } from '@/src/services/apiServices';

// @ts-expect-error JS module

import { getBankLogoUrl } from '@/src/utils/bankBranding';



const TABS = ['Overview', 'Applications', 'Documents', 'Notifications'];

type BankRecord = {
  id?: string | number;
  name?: string;
  logoUrl?: string | null;
  applyUrl?: string | null;
  bankType?: string;
};

const QUICK_APPLY = [
  { loanType: 'personal_loan', label: 'Personal', icon: 'person-outline' as const },
  { loanType: 'home_loan', label: 'Home', icon: 'home-outline' as const },
  { loanType: 'business_loan', label: 'Business', icon: 'briefcase-outline' as const },
  { loanType: 'auto_loan', label: 'Vehicle', icon: 'car-outline' as const },
];

async function openExternalUrl(url?: string | null) {
  if (!url) return;
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
    else Alert.alert('Cannot open link', 'This bank application link is not available.');
  } catch {
    Alert.alert('Cannot open link', 'This bank application link is not available.');
  }
}

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'identity_proof', label: 'Identity Proof (Aadhaar/PAN/Passport)' },
  { value: 'address_proof', label: 'Address Proof' },
  { value: 'income_proof', label: 'Income Proof (Salary Slip/ITR)' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'tax_return', label: 'Tax Return' },
  { value: 'employment_letter', label: 'Employment Letter' },
  { value: 'other', label: 'Other' },
];



export default function CustomerDashboardScreen() {

  const { user, signOut } = useAuth();

  const [tab, setTab] = useState(0);

  const [apps, setApps] = useState<Record<string, unknown>[]>([]);

  const [docs, setDocs] = useState<Record<string, unknown>[]>([]);

  const [notifications, setNotifications] = useState<Record<string, unknown>[]>([]);

  const [applyBanks, setApplyBanks] = useState<BankRecord[]>([]);

  const [selectedApp, setSelectedApp] = useState<Record<string, unknown> | null>(null);

  const [selectedDoc, setSelectedDoc] = useState<Record<string, unknown> | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);

  const [docType, setDocType] = useState('');

  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);

  const [uploading, setUploading] = useState(false);

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

    try {

      const banks = await bankService.getActiveBanks({ includeProducts: false });

      const list: BankRecord[] = Array.isArray(banks) ? banks : banks?.data || [];

      setApplyBanks(list.filter((b) => !!b?.applyUrl));

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



  const closeUploadModal = () => {

    setUploadOpen(false);

    setDocType('');

    setPickedFile(null);

    setUploading(false);

  };

  const pickFile = async () => {

    const file = await pickDocument();

    if (file) setPickedFile(file);

  };

  const submitUpload = async () => {

    if (!docType) {

      Alert.alert('Missing info', 'Please select a document type.');

      return;

    }

    if (!pickedFile) {

      Alert.alert('Missing info', 'Please select a file to upload.');

      return;

    }

    setUploading(true);

    try {

      const applicationId = apps[0]?.id ? String(apps[0].id) : undefined;

      const filePayload = {

        uri: pickedFile.uri,

        name: pickedFile.name,

        type: pickedFile.mimeType || 'application/octet-stream',

      };

      const { error } = await customerJourneyService.uploadDocument(filePayload, {

        documentType: docType,

        applicationId,

        customerId: user?.id,

      });

      if (error) throw error;

      Alert.alert('Success', 'Document uploaded successfully.');

      closeUploadModal();

      refresh();

    } catch (e) {

      const message = (e as { message?: string })?.message || 'Could not upload document.';

      Alert.alert('Upload failed', message);

    }

    setUploading(false);

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

          <View style={styles.hero}>

            <View style={styles.heroRow}>

              <View style={styles.heroAvatar}>

                <Ionicons name="person" size={24} color="#fff" />

              </View>

              <View style={{ flex: 1 }}>

                <Text style={styles.heroGreeting}>Welcome back</Text>

                <Text style={styles.heroName} numberOfLines={1}>{user.firstName || user.email}</Text>

              </View>

              <TouchableOpacity style={styles.heroIconBtn} onPress={() => router.push('/(customer)/profile')}>

                <Ionicons name="settings-outline" size={20} color="#fff" />

              </TouchableOpacity>

            </View>

            <View style={styles.heroActions}>

              <TouchableOpacity style={styles.heroPrimaryBtn} onPress={() => router.push('/(customer)/assessment')} activeOpacity={0.85}>

                <Ionicons name="add-circle-outline" size={18} color={colors.customer} />

                <Text style={styles.heroPrimaryText}>New Application</Text>

              </TouchableOpacity>

              <TouchableOpacity style={styles.heroGhostBtn} onPress={() => router.push({ pathname: '/(customer)/assessment', params: { resume: '1' } })} activeOpacity={0.85}>

                <Ionicons name="document-text-outline" size={18} color="#fff" />

                <Text style={styles.heroGhostText}>Resume Draft</Text>

              </TouchableOpacity>

            </View>

          </View>

          <Text style={styles.section}>Quick Apply</Text>

          <View style={styles.quickGrid}>

            {QUICK_APPLY.map((q) => (

              <TouchableOpacity

                key={q.loanType}

                style={styles.quickCard}

                activeOpacity={0.85}

                onPress={() => router.push({ pathname: '/(customer)/assessment', params: { loanType: q.loanType } })}

              >

                <View style={styles.quickIcon}>

                  <Ionicons name={q.icon} size={22} color={colors.customer} />

                </View>

                <Text style={styles.quickLabel}>{q.label}</Text>

              </TouchableOpacity>

            ))}

          </View>

          <View style={styles.sectionRow}>

            <Text style={styles.section}>Active Applications</Text>

            {apps.length > 2 ? (

              <TouchableOpacity onPress={() => setTab(1)}><Text style={styles.viewHint}>View all</Text></TouchableOpacity>

            ) : null}

          </View>

          {apps.length === 0 ? (

            <Card><Text style={styles.meta}>No applications yet. Start a new application above.</Text></Card>

          ) : apps.slice(0, 2).map((app) => {

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

          {applyBanks.length > 0 ? (

            <>

              <View style={styles.sectionRow}>

                <Text style={styles.section}>Apply for Credit Cards & Loans</Text>

                <TouchableOpacity onPress={() => router.push('/(customer)/(tabs)/marketplace')}><Text style={styles.viewHint}>All banks</Text></TouchableOpacity>

              </View>

              <FlatList

                horizontal

                data={applyBanks}

                keyExtractor={(item) => String(item.id)}

                showsHorizontalScrollIndicator={false}

                contentContainerStyle={{ paddingRight: 8, paddingBottom: 4 }}

                renderItem={({ item }) => (

                  <View style={styles.bankCard}>

                    <View style={styles.bankLogoWrap}>

                      {getBankLogoUrl(item) ? (

                        <Image source={{ uri: getBankLogoUrl(item) }} style={styles.bankLogo} resizeMode="contain" />

                      ) : (

                        <Ionicons name="business-outline" size={22} color={colors.primary} />

                      )}

                    </View>

                    <Text style={styles.bankName} numberOfLines={2}>{item.name}</Text>

                    <TouchableOpacity style={styles.bankApplyBtn} onPress={() => openExternalUrl(item.applyUrl)} activeOpacity={0.85}>

                      <Text style={styles.bankApplyText}>Apply</Text>

                      <Ionicons name="open-outline" size={14} color="#fff" />

                    </TouchableOpacity>

                  </View>

                )}

              />

            </>

          ) : null}

          <Text style={styles.section}>Recent Documents ({docs.length})</Text>

          {docs.slice(0, 4).map((d) => (

            <Card key={String(d.id)}>

              <TouchableOpacity onPress={() => setSelectedDoc(d)}>

                <Text style={styles.docTitle}>{documentTypeLabel(String(d.documentType || d.type))}</Text>

                <Text style={styles.meta}>Tap to view · Status: {String(d.status || 'uploaded')}</Text>

              </TouchableOpacity>

            </Card>

          ))}

          <Button title="Sign Out" variant="ghost" onPress={async () => { await signOut(); router.replace('/(customer)/(tabs)/home'); }} style={{ marginTop: 8, marginBottom: 16 }} />

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

                <TouchableOpacity onPress={() => setSelectedDoc(item)} activeOpacity={0.85}>

                  <View style={styles.docRow}>

                    <View style={{ flex: 1 }}>

                      <Text style={styles.docTitle}>{documentTypeLabel(String(item.documentType || item.type))}</Text>

                      <Text style={styles.meta}>Status: {String(item.status || 'uploaded')}</Text>

                      {item.documentName || item.document_name ? (

                        <Text style={styles.meta} numberOfLines={1}>{String(item.documentName || item.document_name)}</Text>

                      ) : null}

                    </View>

                    <Text style={styles.viewHint}>View</Text>

                  </View>

                </TouchableOpacity>

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



      <DocumentPreviewModal
        visible={!!selectedDoc}
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />



      <Modal visible={uploadOpen} transparent animationType="slide" onRequestClose={closeUploadModal}>

        <View style={styles.modalBg}>

          <View style={styles.modal}>

            <Text style={styles.modalTitle}>Upload Document</Text>

            <Select

              label="Document Type"

              placeholder="Select document type"

              options={DOCUMENT_TYPE_OPTIONS}

              value={docType}

              onChange={setDocType}

            />

            <Button title={pickedFile ? 'Change File' : 'Select File'} variant="outline" onPress={pickFile} />

            {pickedFile ? (

              <Text style={styles.fileName} numberOfLines={2}>{pickedFile.name}</Text>

            ) : (

              <Text style={styles.meta}>PDF, JPG, or PNG (max 10MB)</Text>

            )}

            <Button

              title={uploading ? 'Uploading…' : 'Upload Document'}

              onPress={submitUpload}

              variant="customer"

              disabled={uploading || !docType || !pickedFile}

              style={{ marginTop: 12 }}

            />

            <Button title="Cancel" variant="ghost" onPress={closeUploadModal} style={{ marginTop: 8 }} disabled={uploading} />

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

  section: { marginTop: 12, fontWeight: '600', marginBottom: 8, fontSize: 15, color: colors.foreground },

  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },

  hero: {
    backgroundColor: colors.customer,
    borderRadius: 18,
    padding: 18,
    marginBottom: 4,
  },

  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  heroAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroGreeting: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },

  heroName: { color: '#fff', fontSize: 18, fontWeight: '800' },

  heroIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroActions: { flexDirection: 'row', gap: 10, marginTop: 16 },

  heroPrimaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 11,
  },

  heroPrimaryText: { color: colors.customer, fontWeight: '700', fontSize: 14 },

  heroGhostBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },

  heroGhostText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  quickCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },

  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${colors.customer}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickLabel: { fontSize: 13, fontWeight: '600', color: colors.foreground },

  bankCard: {
    width: 140,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
  },

  bankLogoWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  bankLogo: { width: 36, height: 36 },

  bankName: { fontSize: 13, fontWeight: '600', color: colors.foreground, textAlign: 'center', minHeight: 34 },

  bankApplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.customer,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
    alignSelf: 'stretch',
  },

  bankApplyText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  appRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  appNum: { fontWeight: '700', fontSize: 15 },

  docTitle: { fontWeight: '600', fontSize: 15, color: colors.foreground },

  docRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  viewHint: { fontSize: 13, fontWeight: '600', color: colors.customer },

  meta: { fontSize: 12, color: colors.mutedForeground, marginTop: 4 },

  unread: { fontWeight: '700' },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },

  modal: { backgroundColor: colors.card, borderRadius: 16, padding: 20 },

  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },

  fileName: { fontSize: 13, color: colors.foreground, marginTop: 8 },

});


