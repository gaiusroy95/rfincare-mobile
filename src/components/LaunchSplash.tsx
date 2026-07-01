import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import BrandLogo from '@/src/components/BrandLogo';
import { SPLASH_BACKGROUND } from '@/src/constants/branding';

/** Full-screen launch branding shown while fonts and auth initialize. */
export default function LaunchSplash() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={SPLASH_BACKGROUND} />
      <BrandLogo size="lg" variant="splash" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPLASH_BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
});
