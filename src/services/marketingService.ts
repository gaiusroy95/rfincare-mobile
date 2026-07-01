import { apiClient } from '../api/apiClient';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UTM_STORAGE_KEY = 'rfincare_utm_attribution';

export type MarketingSettings = {
  gaMeasurementId?: string;
  gtmContainerId?: string;
  gaEnabled?: boolean;
  metaPixelId?: string;
  metaPixelEnabled?: boolean;
  seoSiteName?: string;
  seoDefaultTitle?: string;
  seoDefaultDescription?: string;
  seoKeywords?: string;
  seoOgImage?: string;
  seoCanonicalUrl?: string;
  seoRobots?: string;
  pageSeo?: Array<{ path: string; title?: string; description?: string }>;
  adCampaigns?: unknown[];
  customTags?: unknown[];
};

let cachedSettings: MarketingSettings | null = null;

export async function fetchMarketingSettings(): Promise<MarketingSettings> {
  if (cachedSettings) return cachedSettings;
  try {
    const res = await apiClient.get('/public/marketing-settings');
    cachedSettings = res.data;
    return res.data;
  } catch {
    return {};
  }
}

export function clearMarketingSettingsCache() {
  cachedSettings = null;
}

export async function storeUtmAttribution(params: Record<string, string | undefined>) {
  const utm = {
    utmSource: params.utm_source || params.utmSource || '',
    utmMedium: params.utm_medium || params.utmMedium || '',
    utmCampaign: params.utm_campaign || params.utmCampaign || '',
    utmContent: params.utm_content || params.utmContent || '',
    utmTerm: params.utm_term || params.utmTerm || '',
    capturedAt: Date.now(),
  };
  if (utm.utmSource || utm.utmCampaign) {
    await AsyncStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
  }
  return utm;
}

export async function getStoredUtm() {
  try {
    const raw = await AsyncStorage.getItem(UTM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getPlatformLabel(): 'web' | 'ios' | 'android' | 'mobile' {
  if (Platform.OS === 'web') return 'web';
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return 'mobile';
}

export async function trackMarketingEvent(
  eventName: string,
  extra: Record<string, unknown> = {},
  pagePath?: string,
) {
  const utm = await getStoredUtm();
  try {
    await apiClient.post('/public/marketing/track', {
      eventName,
      platform: getPlatformLabel(),
      pagePath: pagePath || '',
      utmSource: utm.utmSource || undefined,
      utmMedium: utm.utmMedium || undefined,
      utmCampaign: utm.utmCampaign || undefined,
      utmContent: utm.utmContent || undefined,
      utmTerm: utm.utmTerm || undefined,
      payload: extra,
    });
  } catch {
    /* non-blocking */
  }

  // Expo web: forward to gtag/fbq if injected
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const w = window as Window & {
      gtag?: (...args: unknown[]) => void;
      fbq?: (...args: unknown[]) => void;
    };
    if (w.gtag) {
      w.gtag('event', eventName, extra);
    }
    if (w.fbq) {
      if (eventName === 'page_view') w.fbq('track', 'PageView');
      else w.fbq('trackCustom', eventName, extra);
    }
  }
}

export async function installWebMarketingTags(settings: MarketingSettings) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  const gaId = settings.gaEnabled && settings.gaMeasurementId ? settings.gaMeasurementId : '';
  const pixelId = settings.metaPixelEnabled && settings.metaPixelId ? settings.metaPixelId : '';

  const inject = (id: string, src?: string, inline?: string) => {
    if (document.getElementById(id)) return;
    const script = document.createElement('script');
    script.id = id;
    if (src) {
      script.src = src;
      script.async = true;
    } else if (inline) {
      script.text = inline;
    }
    document.head.appendChild(script);
  };

  if (gaId) {
    inject('rf-mobile-gtag', `https://www.googletagmanager.com/gtag/js?id=${gaId}`);
    const w = window as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
    w.dataLayer = w.dataLayer || [];
    w.gtag = w.gtag || function gtag(...args: unknown[]) {
      w.dataLayer?.push(args);
    };
    w.gtag('js', new Date());
    w.gtag('config', gaId, { send_page_view: false });
  }

  if (pixelId) {
    const w = window as Window & {
      fbq?: (...args: unknown[]) => void & { queue?: unknown[]; loaded?: boolean; version?: string };
      _fbq?: unknown;
    };
    if (!w.fbq) {
      const n = function fbq(...args: unknown[]) {
        const fn = n as typeof n & { callMethod?: (...a: unknown[]) => void; queue: unknown[] };
        if (fn.callMethod) fn.callMethod(...args);
        else fn.queue.push(args);
      };
      const fn = n as typeof n & { queue: unknown[]; loaded: boolean; version: string };
      fn.queue = [];
      fn.loaded = true;
      fn.version = '2.0';
      w.fbq = n;
      w._fbq = n;
      inject('rf-mobile-fbpixel', 'https://connect.facebook.net/en_US/fbevents.js');
    }
    w.fbq?.('init', pixelId);
  }
}
