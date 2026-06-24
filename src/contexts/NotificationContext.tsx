import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  addNotificationListeners,
  getInitialNotificationResponse,
  handleNotificationNavigation,
  isPushAvailable,
  registerPushForUser,
  unregisterPushToken,
} from '@/src/services/pushNotificationService';

type NotificationContextType = {
  refreshPushRegistration: () => Promise<void>;
  pushAvailable: boolean;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const refreshPushRegistration = useCallback(async () => {
    if (!user?.id) return;
    await registerPushForUser(user.role);
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!user?.id || !isPushAvailable()) return undefined;
    let cancelled = false;
    let removeListeners = () => {};

    (async () => {
      if (cancelled) return;
      await registerPushForUser(user.role);
      const initial = await getInitialNotificationResponse();
      if (initial) handleNotificationNavigation(initial, user.role);
    })();

    removeListeners = addNotificationListeners(user.role);
    return () => {
      cancelled = true;
      removeListeners();
    };
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!user) {
      unregisterPushToken().catch(() => {});
    }
  }, [user]);

  return (
    <NotificationContext.Provider value={{ refreshPushRegistration, pushAvailable: isPushAvailable() }}>
      {children}
    </NotificationContext.Provider>
  );
}
