const DEFAULT_API = 'https://rfincare.onrender.com';

export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
  return fromEnv || DEFAULT_API;
}

export const MOBILE_CLIENT_HEADER = 'mobile';
