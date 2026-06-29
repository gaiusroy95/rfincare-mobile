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

import CreditScoreCard from '@/src/components/dashboard/CreditScoreCard';

import ApplicationStatusCard from '@/src/components/dashboard/ApplicationStatusCard';

// @ts-expect-error JS module
import { documentTypeLabel } from '@/src/utils/documentUrls';

// @ts-expect-error JS module

import { customerJourneyService } from '@/src/services/customerJourneyService';

// @ts-expect-error JS module
import { bankService } from '@/src/services/apiServices';
import { creditCardService, type CreditCard } from '@/src/services/creditCardService';

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

  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);

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

    try {
      const cards = await creditCardService.listActive();
      setCreditCards(Array.isArray(cards) ? cards.slice(0, 4) : []);
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



  const latestApp = apps[0] || null;

  const latestCreditScoreRange = (() => {

    if (!latestApp) return null;

    const data = (latestApp.data && typeof latestApp.data === 'object' ? latestApp.data : {}) as Record<string, unknown>;

    return (

      latestApp.creditScoreRange

      || latestApp.credit_score_range

      || data.creditScoreRange

      || data.credit_score_range

      || null

    ) as string | null;

  })();

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

          <View style={styles.greetingRow}>

            <View style={styles.greetingAvatar}>

              <Ionicons name="person" size={22} color={colors.customer} />

            </View>

            <View style={{ flex: 1 }}>

              <Text style={styles.greetingSmall}>Welcome back,</Text>

              <Text style={styles.greetingName} numberOfLines={1}>Hello, {user.firstName || (user.email || '').split('@')[0]}</Text>

            </View>

            <TouchableOpacity style={styles.greetingBell} onPress={() => setTab(3)}>

              <Ionicons name="notifications-outline" size={22} color={colors.foreground} />

              {notifications.some((n) => !n.read) ? <View style={styles.bellDot} /> : null}

            </TouchableOpacity>

          </View>

          <CreditScoreCard

            range={latestCreditScoreRange}

            onViewReport={() => router.push('/(customer)/eligibility')}

          />

          {latestApp ? (

            <ApplicationStatusCard

              application={latestApp}

              onUploadDocs={() => setUploadOpen(true)}

              onDetails={() => setSelectedApp(latestApp)}

            />

          ) : (

            <Card>

              <Text style={styles.docTitle}>No active application</Text>

              <Text style={styles.meta}>Start a new application to track its progress here.</Text>

              <Button title="New Application" variant="customer" onPress={() => router.push('/(customer)/assessment')} style={{ marginTop: 12 }} />

            </Card>

          )}

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

            {(creditCards.length ? creditCards : [{ id: 'browse', name: 'Credit Cards', bankName: 'Compare' }]).map((card) => (

              <TouchableOpacity

                key={card.id}

                style={styles.quickCard}

                activeOpacity={0.85}

                onPress={() => router.push('/(customer)/credit-cards')}

              >

                <View style={[styles.quickIcon, { backgroundColor: '#EDE9FE' }]}>

                  <Ionicons name="card-outline" size={22} color="#6D28D9" />

                </View>

                <Text style={styles.quickLabel} numberOfLines={2}>{card.name}</Text>

              </TouchableOpacity>

            ))}

          </View>

          {creditCards.length > 0 ? (

            <TouchableOpacity onPress={() => router.push('/(customer)/credit-cards')} style={{ marginBottom: 8 }}>

              <Text style={styles.viewHint}>Compare all credit cards →</Text>

            </TouchableOpacity>

          ) : null}

          {applyBanks.length > 0 ? (

            <>

              <View style={styles.sectionRow}>

                <Text style={styles.section}>Exclusive Offers</Text>

                <TouchableOpacity onPress={() => router.push('/(customer)/(tabs)/marketplace')}><Text style={styles.viewHint}>View All</Text></TouchableOpacity>

              </View>

              <FlatList

                horizontal

                data={applyBanks}

                keyExtractor={(item) => String(item.id)}

                showsHorizontalScrollIndicator={false}

                contentContainerStyle={{ paddingRight: 8, paddingBottom: 4 }}

                renderItem={({ item }) => (

                  <View style={styles.offerCard}>

                    <View style={styles.offerTop}>

                      <View style={styles.offerLogoWrap}>

                        {getBankLogoUrl(item) ? (

                          <Image source={{ uri: getBankLogoUrl(item) }} style={styles.offerLogo} resizeMode="contain" />

                        ) : (

                          <Ionicons name="card-outline" size={22} color="#fff" />

                        )}

                      </View>

                      <Ionicons name="sparkles" size={16} color="rgba(255,255,255,0.8)" />

                    </View>

                    <Text style={styles.offerName} numberOfLines={2}>{item.name}</Text>

                    <Text style={styles.offerSub}>Apply directly on the bank website</Text>

                    <TouchableOpacity style={styles.offerBtn} onPress={() => openExternalUrl(item.applyUrl)} activeOpacity={0.85}>

                      <Text style={styles.offerBtnText}>Apply Now</Text>

                      <Ionicons name="arrow-forward" size={14} color={colors.primary} />

                    </TouchableOpacity>

                  </View>

                )}

              />

            </>

          ) : null}

          <View style={styles.sectionRow}>

            <Text style={styles.section}>Recent Documents ({docs.length})</Text>

            {docs.length > 0 ? (

              <TouchableOpacity onPress={() => setTab(2)}><Text style={styles.viewHint}>View All</Text></TouchableOpacity>

            ) : null}

          </View>

          {docs.length === 0 ? (

            <Card><Text style={styles.meta}>No documents uploaded yet.</Text></Card>

          ) : docs.slice(0, 4).map((d) => (

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

  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },

  greetingAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${colors.customer}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  greetingSmall: { fontSize: 12, color: colors.mutedForeground },

  greetingName: { fontSize: 18, fontWeight: '800', color: colors.foreground },

  greetingBell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bellDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.destructive,
  },

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

  offerCard: {
    width: 220,
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
  },

  offerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },

  offerLogoWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  offerLogo: { width: 30, height: 30 },

  offerName: { fontSize: 16, fontWeight: '700', color: '#fff' },

  offerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4, marginBottom: 14 },

  offerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
  },

  offerBtnText: { color: colors.primary, fontWeight: '700', fontSize: 14 },

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


