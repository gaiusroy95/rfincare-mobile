import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: '\u200B',
  slug: 'rfincare',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/logo.jpg',
  scheme: 'rfincare',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.rfincare.app',
    infoPlist: {
      CFBundleDisplayName: 'rfincare',
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.rfincare.app',
    adaptiveIcon: {
      backgroundColor: '#E85A24',
      foregroundImage: './assets/images/logo.jpg',
    },
  },
  plugins: [
    [
      'expo-notifications',
      {
        icon: './assets/images/logo.jpg',
        color: '#E85A24',
        defaultChannel: 'rfincare-updates',
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/images/logo.jpg',
        resizeMode: 'contain',
        backgroundColor: '#E85A24',
        imageWidth: 220,
      },
    ],
    'expo-router',
    'expo-secure-store',
    'expo-font',
    'expo-web-browser',
  ],
  experiments: { typedRoutes: true },
  extra: {
    eas: { projectId: '25c751e3-d1d4-4ef5-aae0-b666a5e4d97c' },
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://rfincare.onrender.com',
  },
});
