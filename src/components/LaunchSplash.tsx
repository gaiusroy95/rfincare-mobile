import React from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';

const SPLASH_LOGO = require('../../assets/images/logo.jpg');

/** Full-screen launch branding shown while fonts and auth initialize. */
export default function LaunchSplash() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E85A24" />
      <Image source={SPLASH_LOGO} style={styles.logo} resizeMode="contain" accessibilityLabel="rfincare" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E85A24',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 220,
    height: 220,
  },
});
