import { ExpoConfig, ConfigContext } from 'expo/config';

const APP_DISPLAY_NAME = 'Rfincare';
const APP_SLUG = 'rfincare';
const SPLASH_BACKGROUND = '#E85A24';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: APP_DISPLAY_NAME,
  slug: APP_SLUG,
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/logo.jpg',
  scheme: APP_SLUG,
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.rfincare.app',
    infoPlist: {
      CFBundleDisplayName: APP_DISPLAY_NAME,
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.rfincare.app',
    adaptiveIcon: {
      backgroundColor: SPLASH_BACKGROUND,
      foregroundImage: './assets/images/logo.jpg',
    },
  },
  plugins: [
    [
      'expo-notifications',
      {
        icon: './assets/images/logo.jpg',
        color: SPLASH_BACKGROUND,
        defaultChannel: 'rfincare-updates',
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/images/logo.jpg',
        resizeMode: 'contain',
        backgroundColor: SPLASH_BACKGROUND,
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
