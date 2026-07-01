import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { apiClient } from '@/src/api/apiClient';

type Options = {
  applicationId?: string;
  enabled?: boolean;
  intervalMs?: number;
  onUpdate?: (data: unknown) => void;
};

export function useApplicationPolling({
  applicationId,
  enabled = true,
  intervalMs = 30000,
  onUpdate,
}: Options) {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchApp = useCallback(async () => {
    if (!applicationId || !enabled) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/loan-applications/${applicationId}`);
      setData(res.data);
      onUpdate?.(res.data);
      setError(null);
    } catch (e) {
      setError((e as { message?: string }).message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [applicationId, enabled, onUpdate]);

  const refresh = useCallback(async () => {
    await fetchApp();
  }, [fetchApp]);

  useEffect(() => {
    if (!enabled || !applicationId) return;
    fetchApp();
    timer.current = setInterval(fetchApp, intervalMs);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [applicationId, enabled, intervalMs, fetchApp]);

  useEffect(() => {
    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') fetchApp();
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => sub.remove();
  }, [fetchApp]);

  return { data, loading, error, refresh };
}

export function useApplicationsList(enabled = true, intervalMs = 60000) {
  const [applications, setApplications] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await apiClient.get('/loan-applications/me');
      setApplications(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchList();
    const timer = setInterval(fetchList, intervalMs);
    return () => clearInterval(timer);
  }, [fetchList, intervalMs]);

  return { applications, loading, refresh: fetchList };
}
