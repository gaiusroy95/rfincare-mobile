import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { isRunningInExpoGo } from 'expo';
import { router } from 'expo-router';

import { notificationService } from '@/src/services/notificationService';

type NotificationsModule = typeof import('expo-notifications');

let cachedToken: string | null = null;
let notificationsModule: NotificationsModule | null = null;
let handlerConfigured = false;

/** Remote push is not available in Expo Go (SDK 53+). Use a dev/preview build. */
export function isPushAvailable(): boolean {
  return !isRunningInExpoGo();
}

async function getNotifications(): Promise<NotificationsModule | null> {
  if (!isPushAvailable()) return null;
  if (!notificationsModule) {
    notificationsModule = await import('expo-notifications');
  }
  if (!handlerConfigured && notificationsModule) {
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    handlerConfigured = true;
  }
  return notificationsModule;
}

export function getCachedExpoPushToken() {
  return cachedToken;
}

export async function ensureAndroidChannel() {
  const Notifications = await getNotifications();
  if (!Notifications || Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('rfincare-updates', {
    name: 'Rfincare updates',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#E85A24',
  });
}

export async function requestPushPermissions(): Promise<boolean> {
  if (!isPushAvailable()) return false;
  if (!Device.isDevice) return false;
  const Notifications = await getNotifications();
  if (!Notifications) return false;
  await ensureAndroidChannel();
  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  return status === 'granted';
}

export async function getExpoPushToken(): Promise<string | null> {
  if (!isPushAvailable()) return null;
  if (!Device.isDevice) return null;
  const Notifications = await getNotifications();
  if (!Notifications) return null;
  const granted = await requestPushPermissions();
  if (!granted) return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId ||
    '25c751e3-d1d4-4ef5-aae0-b666a5e4d97c';

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  cachedToken = token.data;
  return token.data;
}

export async function registerPushForUser(role: string) {
  if (!isPushAvailable()) return null;
  const token = await getExpoPushToken();
  if (!token) return null;
  const appVariant = role === 'agent' ? 'agent' : 'customer';
  await notificationService.registerPushToken(
    token,
    appVariant,
    Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web',
  );
  return token;
}

export async function unregisterPushToken() {
  if (!cachedToken) return;
  try {
    await notificationService.unregisterPushToken(cachedToken);
  } catch {
    /* ignore */
  }
  cachedToken = null;
}

function routeFromNotificationData(data: Record<string, unknown> | undefined, role?: string) {
  const type = String(data?.type || '');
  if (role === 'agent') {
    if (data?.applicationId) return '/(agent)/(tabs)/clients';
    return '/(agent)/notifications';
  }
  if (type === 'eligibility') return '/(customer)/eligibility';
  if (data?.applicationId) return '/(customer)/(tabs)/dashboard';
  return '/(customer)/(tabs)/dashboard';
}

export function handleNotificationNavigation(
  response: { notification: { request: { content: { data?: unknown } } } } | null,
  role?: string,
) {
  if (!response) return;
  const data = response.notification.request.content.data as Record<string, unknown> | undefined;
  const href = routeFromNotificationData(data, role);
  router.push(href as never);
}

export function addNotificationListeners(role?: string) {
  if (!isPushAvailable()) {
    return () => {};
  }

  let remove: (() => void) | undefined;

  (async () => {
    const Notifications = await getNotifications();
    if (!Notifications) return;
    const received = Notifications.addNotificationReceivedListener(() => {
      /* in-app list polls from dashboard */
    });
    const response = Notifications.addNotificationResponseReceivedListener((event) => {
      handleNotificationNavigation(event, role);
    });
    remove = () => {
      received.remove();
      response.remove();
    };
  })();

  return () => remove?.();
}

export async function getInitialNotificationResponse() {
  const Notifications = await getNotifications();
  if (!Notifications) return null;
  return Notifications.getLastNotificationResponseAsync();
}
