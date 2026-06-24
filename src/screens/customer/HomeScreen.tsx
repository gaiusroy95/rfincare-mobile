import React, { useEffect, useState } from 'react';

import { View, Text, StyleSheet, Modal, Alert, TouchableOpacity } from 'react-native';

import { useTranslation } from 'react-i18next';

import { router } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import Screen from '@/src/components/Screen';

import CustomerHeaderActions from '@/src/components/customer/CustomerHeaderActions';

import BrandLogo from '@/src/components/BrandLogo';

import Button from '@/src/components/Button';

import Input from '@/src/components/Input';

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



const FAQ = [

  { q: 'How long does approval take?', a: 'Most applications are reviewed within 3–5 business days after document submission.' },

  { q: 'What documents do I need?', a: 'PAN, Aadhaar, income proof, and bank statements are typically required.' },

  { q: 'Can I compare multiple banks?', a: 'Yes — use the Bank Marketplace to filter, sort, and compare up to 3 lenders.' },

];



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

  const [contact, setContact] = useState('');

  const [otp, setOtp] = useState('');

  const [otpSent, setOtpSent] = useState(false);

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



  const requestOtp = async () => {

    try {

      if (statusMode === 'status') {

        await homepageService.requestStatusOtp({ applicationNumber: appNumber, emailOrPhone: contact });

      } else {

        await homepageService.requestDraftRecoveryOtp({ emailOrPhone: contact });

      }

      setOtpSent(true);

    } catch (e: unknown) {

      Alert.alert('Error', (e as Error).message || 'Failed to send OTP');

    }

  };



  const verifyOtp = async () => {

    try {

      if (statusMode === 'status') {

        const res = await homepageService.verifyStatusCheck({ applicationNumber: appNumber, emailOrPhone: contact, otp });

        Alert.alert('Application Status', res?.status || JSON.stringify(res));

      } else {

        const res = await homepageService.verifyDraftRecovery({ emailOrPhone: contact, otp });

        if (res?.resumeUrl) {

          const token = res.resumeUrl.split('/').pop();

          router.push(`/resume/${token}`);

        }

      }

      setStatusOpen(false);

    } catch (e: unknown) {

      Alert.alert('Error', (e as Error).message || 'Verification failed');

    }

  };



  return (

    <Screen title="Home" headerRight={<CustomerHeaderActions />}>

      <BrandLogo size="lg" style={{ marginBottom: 16 }} />



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



      <SectionHeader title="FAQ" subtitle="Quick answers to common questions." />

      {FAQ.map((f, i) => (

        <Card key={i} style={styles.faqCard}>

          <TouchableOpacity onPress={() => setFaqOpen(faqOpen === i ? null : i)} activeOpacity={0.8}>

            <Text style={styles.faqQ}>{f.q}</Text>

          </TouchableOpacity>

          {faqOpen === i ? <Text style={styles.faqA}>{f.a}</Text> : null}

        </Card>

      ))}



      <Modal visible={statusOpen} animationType="slide" transparent>

        <View style={styles.modalBg}>

          <View style={styles.modal}>

            <Text style={styles.modalTitle}>Application Status</Text>

            <View style={styles.row}>

              <Button title="Status" variant={statusMode === 'status' ? 'primary' : 'outline'} onPress={() => setStatusMode('status')} style={{ flex: 1, marginRight: 4 }} />

              <Button title="Resume Draft" variant={statusMode === 'draft' ? 'primary' : 'outline'} onPress={() => setStatusMode('draft')} style={{ flex: 1, marginLeft: 4 }} />

            </View>

            {statusMode === 'status' && <Input label="Application Number" value={appNumber} onChangeText={setAppNumber} />}

            <Input label="Email or Phone" value={contact} onChangeText={setContact} keyboardType="email-address" />

            {otpSent && <Input label="OTP" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} />}

            {!otpSent ? (

              <Button title="Send OTP" onPress={requestOtp} style={{ marginTop: 12 }} />

            ) : (

              <Button title="Verify" onPress={verifyOtp} style={{ marginTop: 12 }} />

            )}

            <Button title="Close" variant="ghost" onPress={() => setStatusOpen(false)} style={{ marginTop: 8 }} />

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

  row: { flexDirection: 'row', marginBottom: 8 },

});


