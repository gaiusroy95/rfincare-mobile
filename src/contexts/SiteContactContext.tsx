import React, { createContext, useContext, useEffect, useState } from 'react';
// @ts-expect-error JS module
import { homepageService } from '@/src/services/homepageService';

const DEFAULT_CONTACT = {
  tagline: 'Intelligent loan matching that works for you.',
  email: 'support@rfincare.com',
  phone: '7300069952',
  emails: ['support@rfincare.com'],
  phones: ['7300069952'],
};

const SiteContactContext = createContext({
  contact: DEFAULT_CONTACT,
  loading: true,
  refresh: async () => {},
});

export function useSiteContact() {
  return useContext(SiteContactContext);
}

export function SiteContactProvider({ children }: { children: React.ReactNode }) {
  const [contact, setContact] = useState(DEFAULT_CONTACT);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await homepageService.getSiteContact();
      if (data) setContact({ ...DEFAULT_CONTACT, ...data });
    } catch {
      /* defaults */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SiteContactContext.Provider value={{ contact, loading, refresh }}>
      {children}
    </SiteContactContext.Provider>
  );
}
