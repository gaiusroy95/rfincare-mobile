import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  APP_CONSENT_STORAGE_KEY,
  APP_CONSENT_VERSION,
  type AppConsentRecord,
} from '@/src/constants/appConsent';

export async function loadAppConsent(): Promise<AppConsentRecord | null> {
  try {
    const raw = await AsyncStorage.getItem(APP_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppConsentRecord;
    if (!parsed?.version || parsed.version !== APP_CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function hasValidAppConsent(): Promise<boolean> {
  const record = await loadAppConsent();
  return Boolean(record?.termsAccepted && record?.contactConsentAccepted);
}

export async function saveAppConsent(record: Omit<AppConsentRecord, 'acceptedAt'> & { acceptedAt?: string }) {
  const payload: AppConsentRecord = {
    version: record.version || APP_CONSENT_VERSION,
    acceptedAt: record.acceptedAt || new Date().toISOString(),
    termsAccepted: record.termsAccepted,
    contactConsentAccepted: record.contactConsentAccepted,
  };
  await AsyncStorage.setItem(APP_CONSENT_STORAGE_KEY, JSON.stringify(payload));
  return payload;
}
