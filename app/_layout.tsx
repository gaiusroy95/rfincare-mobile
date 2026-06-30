import 'react-native-gesture-handler';
import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { NotificationProvider } from '@/src/contexts/NotificationContext';
import { LoanProductsProvider } from '@/src/contexts/LoanProductsContext';
import { SiteContactProvider } from '@/src/contexts/SiteContactContext';
import { MarketingProvider } from '@/src/contexts/MarketingContext';
import LaunchSplash from '@/src/components/LaunchSplash';
import AppInstallConsentScreen from '@/src/screens/AppInstallConsentScreen';
import { hasValidAppConsent } from '@/src/utils/appConsent';
import '@/src/i18n';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [showApp, setShowApp] = useState(false);
  const [consentReady, setConsentReady] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [loaded, error] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Replace Expo Go default text splash with branded image as soon as JS loads.
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (loaded) {
      setShowApp(true);
      hasValidAppConsent()
        .then(setHasConsent)
        .finally(() => setConsentReady(true));
    }
  }, [loaded]);

  if (!showApp || !consentReady) {
    return <LaunchSplash />;
  }

  if (!hasConsent) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppInstallConsentScreen onAccepted={() => setHasConsent(true)} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NotificationProvider>
          <LoanProductsProvider>
            <SiteContactProvider>
              <MarketingProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(customer)" />
                <Stack.Screen name="(agent)" />
                <Stack.Screen name="oauth/callback" />
                <Stack.Screen name="resume/[token]" />
              </Stack>
              </MarketingProvider>
            </SiteContactProvider>
          </LoanProductsProvider>
        </NotificationProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
