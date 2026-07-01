import * as WebBrowser from 'expo-web-browser';
import { getApiBaseUrl } from '@/src/api/runtimeConfig';

WebBrowser.maybeCompleteAuthSession();

const OAUTH_CALLBACK = 'rfincare://oauth/callback';

export async function openOAuth(provider: 'google' | 'microsoft' | 'apple') {
  const base = getApiBaseUrl();
  const url = `${base}/auth/oauth/${provider}?return_origin=${encodeURIComponent(OAUTH_CALLBACK)}`;
  const result = await WebBrowser.openAuthSessionAsync(url, OAUTH_CALLBACK);
  if (result.type === 'success' && result.url) {
    const parsed = new URL(result.url);
    return {
      accessToken: parsed.searchParams.get('accessToken') || undefined,
      refreshToken: parsed.searchParams.get('refreshToken') || undefined,
      error: parsed.searchParams.get('error') || undefined,
    };
  }
  return { error: 'cancelled' };
}
