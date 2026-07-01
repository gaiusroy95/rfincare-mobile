import React, { useEffect, useState } from 'react';

import { View, Text, StyleSheet, Modal, Alert, TouchableOpacity } from 'react-native';

import { useTranslation } from 'react-i18next';

import { router } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import Screen from '@/src/components/Screen';

import CustomerHeaderActions from '@/src/components/customer/CustomerHeaderActions';

import Button from '@/src/components/Button';

import Input from '@/src/components/Input';

import Select from '@/src/components/Select';

import Card from '@/src/components/Card';

import HomeQuickActions from '@/src/components/home/HomeQuickActions';

import HomeVideosSection, { type HomeVideo } from '@/src/components/home/HomeVideosSection';

import HomeHowItWorks from '@/src/components/home/HomeHowItWorks';

import HomeNewsSection, { type HomeNewsItem } from '@/src/components/home/HomeNewsSection';

import HomeLoanProductsSection from '@/src/components/home/HomeLoanProductsSection';

import HomeTrustSection from '@/src/components/home/HomeTrustSection';

import HomeStoriesSection, { type HomeStory } from '@/src/components/home/HomeStoriesSection';

import SectionHeader from '@/src/components/home/SectionHeader';

import { useAuth } from '@/src/contexts/AuthContext';

import { useLoanProducts } from '@/src/contexts/LoanProductsContext';

import { colors } from '@/src/theme';

import { homepageService } from '@/src/services/homepageService';

import { bankService } from '@/src/services/apiServices';



// Customer-facing FAQ. Excludes the agent recruitment question (q7).
const FAQ = [1, 2, 3, 4, 5, 6, 8].map((n) => ({
  qKey: `faq.q${n}`,
  aKey: `faq.a${n}`,
}));



export default function HomeScreen() {

  const { t } = useTranslation();

  const { user } = useAuth();

  const { products, loading: productsLoading } = useLoanProducts();



  const [videos, setVideos] = useState<HomeVideo[]>([]);

  const [news, setNews] = useState<HomeNewsItem[]>([]);

  const [stories, setStories] = useState<HomeStory[]>([]);

  const [banks, setBanks] = useState<Record<string, unknown>[]>([]);

  const [trustHeading, setTrustHeading] = useState<string>();

  const [trustSubtitle, setTrustSubtitle] = useState<string>();

  const [trustStats, setTrustStats] = useState<{ id?: string; value: string; label: string; icon?: string; color?: string }[]>();



  const [contentLoading, setContentLoading] = useState(true);

  const [statusOpen, setStatusOpen] = useState(false);

  const [statusMode, setStatusMode] = useState<'status' | 'draft'>('status');

  const [appNumber, setAppNumber] = useState('');

  const [statusEmail, setStatusEmail] = useState('');

  const [statusPhone, setStatusPhone] = useState('');

  const [statusChannel, setStatusChannel] = useState<'email' | 'sms' | 'whatsapp'>('email');

  const [otp, setOtp] = useState('');

  const [otpSent, setOtpSent] = useState(false);

  const [statusBusy, setStatusBusy] = useState(false);

  const [statusResult, setStatusResult] = useState<Record<string, unknown> | null>(null);

  const [faqOpen, setFaqOpen] = useState<number | null>(null);



  useEffect(() => {

    (async () => {

      setContentLoading(true);

      try {

        const [videoData, newsData, storyData, bankData, trustData] = await Promise.all([

          homepageService.getVideos(),

          homepageService.getNews(),

          homepageService.getSuccessStories(),

          bankService.getActiveBanks(),

          homepageService.getTrustSignals(),

        ]);



        const videoList = Array.isArray(videoData) ? videoData : videoData?.items || [];

        const newsList = Array.isArray(newsData) ? newsData : newsData?.items || [];

        const storyList = Array.isArray(storyData) ? storyData : storyData?.stories || [];

        const bankList = bankData?.data || bankData || [];



        setVideos(

          videoList.map((v: Record<string, unknown>) => ({

            id: String(v.id),

            title: String(v.title || ''),

            description: v.description ? String(v.description) : undefined,

            youtubeUrl: v.youtubeUrl ? String(v.youtubeUrl) : undefined,

            thumbnailUrl: v.thumbnailUrl ? String(v.thumbnailUrl) : undefined,

            durationLabel: v.durationLabel ? String(v.durationLabel) : undefined,

          })),

        );

        setNews(

          newsList.map((n: Record<string, unknown>) => ({

            id: String(n.id),

            title: String(n.title || ''),

            excerpt: n.excerpt ? String(n.excerpt) : undefined,

            imageUrl: n.imageUrl ? String(n.imageUrl) : undefined,

            category: n.category ? String(n.category) : undefined,

            blogUrl: n.blogUrl ? String(n.blogUrl) : undefined,

          })),

        );

        setStories(

          storyList.map((s: Record<string, unknown>) => ({

            id: String(s.id),

            name: s.name ? String(s.name) : undefined,

            storyText: s.storyText ? String(s.storyText) : s.story ? String(s.story) : undefined,

            storyType: s.storyType ? String(s.storyType) : undefined,

            location: s.location ? String(s.location) : undefined,

            loanAmount: s.loanAmount ? String(s.loanAmount) : undefined,

            photoUrl: s.photoUrl ? String(s.photoUrl) : undefined,

          })),

        );

        setBanks(bankList as Record<string, unknown>[]);



        if (trustData) {

          setTrustHeading(trustData.heading);

          setTrustSubtitle(trustData.subtitle);

          if (Array.isArray(trustData.stats)) setTrustStats(trustData.stats);

        }

      } catch {

        /* fallback sections use defaults */

      }

      setContentLoading(false);

    })();

  }, []);



  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const errMsg = (e: unknown, fallback: string) =>
    (e as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error ||
    (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    (e as Error)?.message ||
    fallback;

  const resetStatusFlow = () => {
    setOtpSent(false);
    setOtp('');
    setStatusResult(null);
  };

  const closeStatus = () => {
    setStatusOpen(false);
    resetStatusFlow();
  };

  const requestOtp = async () => {
    const email = statusEmail.trim().toLowerCase();
    const phone = statusPhone.replace(/\D/g, '').slice(-10);

    if (!EMAIL_RE.test(email)) {
      Alert.alert('Email required', 'Enter a valid email address.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      Alert.alert('Mobile required', 'Enter a valid 10-digit mobile number.');
      return;
    }
    if (statusMode === 'status' && !appNumber.trim()) {
      Alert.alert('Application number required', 'Enter your application number.');
      return;
    }

    setStatusBusy(true);
    try {
      if (statusMode === 'status') {
        await homepageService.requestStatusOtp({ email, phone, channel: statusChannel });
      } else {
        await homepageService.requestDraftRecoveryOtp({ email, phone, channel: statusChannel });
      }
      setOtp('');
      setOtpSent(true);
      Alert.alert('OTP sent', `A 6-digit code was sent via ${statusChannel}.`);
    } catch (e: unknown) {
      Alert.alert('Could not send OTP', errMsg(e, 'Failed to send OTP'));
    } finally {
      setStatusBusy(false);
    }
  };

  const verifyOtp = async () => {
    const email = statusEmail.trim().toLowerCase();
    const phone = statusPhone.replace(/\D/g, '').slice(-10);

    if (otp.length !== 6) {
      Alert.alert('OTP required', 'Enter the 6-digit code.');
      return;
    }

    setStatusBusy(true);
    try {
      if (statusMode === 'status') {
        const res = await homepageService.verifyStatusCheck({
          email,
          otp,
          applicationNumber: appNumber.trim(),
        });
        setStatusResult((res?.application as Record<string, unknown>) || null);
      } else {
        const res = await homepageService.verifyDraftRecovery({ email, phone, otp });
        if (res?.resumeUrl) {
          const token = String(res.resumeUrl).split('/').filter(Boolean).pop();
          closeStatus();
          if (token) router.push(`/resume/${token}`);
        } else {
          Alert.alert('No saved application', 'We could not find a saved application to resume.');
        }
      }
    } catch (e: unknown) {
      Alert.alert('Verification failed', errMsg(e, 'Invalid or expired OTP.'));
    } finally {
      setStatusBusy(false);
    }
  };



  return (

    <Screen branded headerRight={<CustomerHeaderActions />}>

      <View style={styles.hero}>

        <View style={styles.heroDecor1} />

        <View style={styles.heroDecor2} />

        <View style={styles.heroIconRow}>

          <View style={styles.heroIcon}>

            <Ionicons name="trending-up" size={22} color="#fff" />

          </View>

          <View style={[styles.heroIcon, styles.heroIconAlt]}>

            <Ionicons name="shield-checkmark" size={22} color="#fff" />

          </View>

        </View>

        <Text style={styles.heroTitle}>{t('home.heroTitle', 'Your Trusted Loan Partner')}</Text>

        <Text style={styles.heroSub}>

          {t('home.heroSub', 'Compare banks, check eligibility, and apply in minutes.')}

        </Text>

      </View>



      <HomeQuickActions showLogin={!user} onStatusCheck={() => setStatusOpen(true)} />



      <HomeVideosSection videos={videos} loading={contentLoading} />



      <HomeHowItWorks />



      <HomeNewsSection items={news} loading={contentLoading} />



      <HomeLoanProductsSection products={products as never[]} loading={productsLoading} />



      <HomeTrustSection

        heading={trustHeading}

        subtitle={trustSubtitle}

        stats={trustStats}

        banks={banks}

      />



      <HomeStoriesSection stories={stories} />



      <SectionHeader title={t('faq.title')} subtitle={t('faq.subtitle')} />

      {FAQ.map((f, i) => (

        <Card key={i} style={styles.faqCard}>

          <TouchableOpacity onPress={() => setFaqOpen(faqOpen === i ? null : i)} activeOpacity={0.8}>

            <Text style={styles.faqQ}>{t(f.qKey)}</Text>

          </TouchableOpacity>

          {faqOpen === i ? <Text style={styles.faqA}>{t(f.aKey)}</Text> : null}

        </Card>

      ))}



      <Modal visible={statusOpen} animationType="slide" transparent onRequestClose={closeStatus}>

        <View style={styles.modalBg}>

          <View style={styles.modal}>

            <Text style={styles.modalTitle}>Application Status</Text>

            <View style={styles.row}>

              <Button title="Status" variant={statusMode === 'status' ? 'primary' : 'outline'} onPress={() => { setStatusMode('status'); resetStatusFlow(); }} style={{ flex: 1, marginRight: 4 }} />

              <Button title="Resume Draft" variant={statusMode === 'draft' ? 'primary' : 'outline'} onPress={() => { setStatusMode('draft'); resetStatusFlow(); }} style={{ flex: 1, marginLeft: 4 }} />

            </View>

            {statusResult ? (

              <View style={{ marginTop: 8 }}>

                <Text style={styles.resultLine}><Text style={styles.resultLabel}>Application: </Text>{String(statusResult.applicationNumber ?? appNumber)}</Text>

                <Text style={styles.resultLine}><Text style={styles.resultLabel}>Status: </Text>{String(statusResult.status ?? '—')}</Text>

                {statusResult.eligibilityStatus ? (

                  <Text style={styles.resultLine}><Text style={styles.resultLabel}>Eligibility: </Text>{String(statusResult.eligibilityStatus)}</Text>

                ) : null}

                {statusResult.statusNotes ? (

                  <Text style={styles.resultNotes}>{String(statusResult.statusNotes)}</Text>

                ) : null}

                <Button title="Done" onPress={closeStatus} style={{ marginTop: 12 }} />

              </View>

            ) : (

              <>

                {statusMode === 'status' && (

                  <Input label="Application Number" value={appNumber} onChangeText={setAppNumber} autoCapitalize="none" editable={!otpSent} />

                )}

                <Input label="Email" value={statusEmail} onChangeText={setStatusEmail} keyboardType="email-address" autoCapitalize="none" editable={!otpSent} />

                <Input label="Mobile number (10 digits)" value={statusPhone} onChangeText={(v) => setStatusPhone(v.replace(/\D/g, '').slice(0, 10))} keyboardType="phone-pad" maxLength={10} editable={!otpSent} />

                {!otpSent && (

                  <Select

                    label="Send OTP via"

                    value={statusChannel}

                    options={[

                      { value: 'email', label: 'Email' },

                      { value: 'sms', label: 'SMS' },

                      { value: 'whatsapp', label: 'WhatsApp' },

                    ]}

                    onChange={(v) => setStatusChannel(v as 'email' | 'sms' | 'whatsapp')}

                  />

                )}

                {otpSent && <Input label="Enter 6-digit OTP" value={otp} onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" maxLength={6} />}

                {!otpSent ? (

                  <Button title={statusBusy ? 'Sending…' : 'Send OTP'} onPress={requestOtp} disabled={statusBusy} style={{ marginTop: 12 }} />

                ) : (

                  <>

                    <Button title={statusBusy ? 'Verifying…' : 'Verify'} onPress={verifyOtp} disabled={statusBusy} style={{ marginTop: 12 }} />

                    <Button title="Change details" variant="ghost" onPress={resetStatusFlow} style={{ marginTop: 4 }} />

                  </>

                )}

              </>

            )}

            <Button title="Close" variant="ghost" onPress={closeStatus} style={{ marginTop: 8 }} />

          </View>

        </View>

      </Modal>

    </Screen>

  );

}



const styles = StyleSheet.create({

  hero: {

    marginBottom: 8,

    padding: 20,

    borderRadius: 18,

    backgroundColor: colors.primary,

    overflow: 'hidden',

    position: 'relative',

  },

  heroDecor1: {

    position: 'absolute',

    width: 120,

    height: 120,

    borderRadius: 60,

    backgroundColor: 'rgba(255,255,255,0.08)',

    top: -30,

    right: -20,

  },

  heroDecor2: {

    position: 'absolute',

    width: 80,

    height: 80,

    borderRadius: 40,

    backgroundColor: 'rgba(255,255,255,0.06)',

    bottom: -20,

    left: -10,

  },

  heroIconRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },

  heroIcon: {

    width: 40,

    height: 40,

    borderRadius: 12,

    backgroundColor: 'rgba(255,255,255,0.2)',

    alignItems: 'center',

    justifyContent: 'center',

  },

  heroIconAlt: { backgroundColor: 'rgba(236,72,153,0.35)' },

  heroTitle: { fontSize: 24, fontWeight: '700', color: '#fff' },

  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.92)', marginTop: 8, lineHeight: 20 },

  faqCard: { marginBottom: 8 },

  faqQ: { fontSize: 15, fontWeight: '600', color: colors.foreground },

  faqA: { fontSize: 13, color: colors.mutedForeground, marginTop: 8, lineHeight: 18 },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },

  modal: { backgroundColor: colors.card, borderRadius: 16, padding: 20 },

  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },

  resultLine: { fontSize: 15, color: colors.foreground, marginTop: 6 },

  resultLabel: { fontWeight: '700' },

  resultNotes: { fontSize: 13, color: colors.mutedForeground, marginTop: 8, lineHeight: 18 },

  row: { flexDirection: 'row', marginBottom: 8 },

});


