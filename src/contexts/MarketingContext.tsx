import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePathname, useGlobalSearchParams } from 'expo-router';

import {
  fetchMarketingSettings,
  installWebMarketingTags,
  storeUtmAttribution,
  trackMarketingEvent,
  type MarketingSettings,
} from '@/src/services/marketingService';

type MarketingContextValue = {
  settings: MarketingSettings;
  loading: boolean;
  trackEvent: (name: string, extra?: Record<string, unknown>) => void;
};

const MarketingContext = createContext<MarketingContextValue>({
  settings: {},
  loading: true,
  trackEvent: () => {},
});

export function useMarketing() {
  return useContext(MarketingContext);
}

export function MarketingProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<MarketingSettings>({});
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  useEffect(() => {
    (async () => {
      const data = await fetchMarketingSettings();
      setSettings(data);
      setLoading(false);
      await installWebMarketingTags(data);
    })();
  }, []);

  useEffect(() => {
    const utmParams: Record<string, string | undefined> = {};
    Object.entries(params || {}).forEach(([k, v]) => {
      if (k.startsWith('utm_')) utmParams[k] = Array.isArray(v) ? v[0] : String(v ?? '');
    });
    if (Object.keys(utmParams).length) {
      storeUtmAttribution(utmParams);
    }
  }, [params]);

  useEffect(() => {
    if (!pathname) return;
    trackMarketingEvent('page_view', {}, pathname);
  }, [pathname]);

  const trackEvent = useCallback(
    (name: string, extra: Record<string, unknown> = {}) => {
      trackMarketingEvent(name, extra, pathname || '');
    },
    [pathname],
  );

  return (
    <MarketingContext.Provider value={{ settings, loading, trackEvent }}>
      {children}
    </MarketingContext.Provider>
  );
}
