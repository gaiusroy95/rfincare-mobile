import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { getApiBaseUrl, MOBILE_CLIENT_HEADER } from './runtimeConfig';

const ACCESS_KEY = 'rfincare_access_token';
const REFRESH_KEY = 'rfincare_refresh_token';

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshingPromise: Promise<string | null> | null = null;
let onAuthFailure: (() => void) | null = null;

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 90000,
  headers: {
    'X-Rfincare-Client': MOBILE_CLIENT_HEADER,
  },
});

export async function loadStoredTokens() {
  try {
    accessToken = (await SecureStore.getItemAsync(ACCESS_KEY)) || null;
    refreshToken = (await SecureStore.getItemAsync(REFRESH_KEY)) || null;
  } catch {
    accessToken = null;
    refreshToken = null;
  }
}

export async function setTokens(access: string | null, refresh?: string | null) {
  accessToken = access;
  if (refresh !== undefined) refreshToken = refresh;
  try {
    if (access) await SecureStore.setItemAsync(ACCESS_KEY, access);
    else await SecureStore.deleteItemAsync(ACCESS_KEY);
    if (refresh) await SecureStore.setItemAsync(REFRESH_KEY, refresh);
    else if (refresh === null) await SecureStore.deleteItemAsync(REFRESH_KEY);
  } catch {
    /* ignore */
  }
}

export function setAccessToken(token: string | null) {
  return setTokens(token);
}

export function getRefreshToken() {
  return refreshToken;
}

export function getAccessToken() {
  return accessToken;
}

export function setOnAuthFailure(handler: () => void) {
  onAuthFailure = handler;
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  config.headers['X-Rfincare-Client'] = MOBILE_CLIENT_HEADER;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { __isRetry?: boolean };
    if (!original || original.__isRetry || error.response?.status !== 401) throw error;
    if (original.url?.startsWith('/auth/')) throw error;

    if (!refreshingPromise) {
      refreshingPromise = (async () => {
        if (!refreshToken) return null;
        try {
          const res = await apiClient.post(
            '/auth/refresh',
            { refreshToken },
            { headers: { Authorization: undefined } },
          );
          const newAccess = res.data?.accessToken as string;
          const newRefresh = res.data?.refreshToken as string | undefined;
          await setTokens(newAccess, newRefresh ?? refreshToken);
          return newAccess;
        } catch (refreshErr: unknown) {
          const status = (refreshErr as AxiosError)?.response?.status;
          if (status === 401 || status === 403) {
            await setTokens(null, null);
            onAuthFailure?.();
          }
          return null;
        }
      })().finally(() => {
        refreshingPromise = null;
      });
    }

    try {
      const token = await refreshingPromise;
      if (!token) throw error;
    } catch {
      throw error;
    }

    original.__isRetry = true;
    return apiClient.request(original);
  },
);
