import { useEffect, useRef, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// @ts-expect-error JS module
import { leadService } from '@/src/services/leadService';

const FORM_KEY = 'loan_assessment_form_data';
const STEP_KEY = 'loan_assessment_step';
const SESSION_KEY = 'loan_assessment_session';
const DEBOUNCE_MS = 3000;

type Options<T> = {
  formData: T;
  step: number;
  enabled?: boolean;
  loanType?: string;
  applicationId?: string;
  onSaved?: () => void;
};

export function useAutoSave<T extends Record<string, unknown>>({
  formData,
  step,
  enabled = true,
  loanType,
  applicationId,
  onSaved,
}: Options<T>) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated = useRef(false);

  const saveNow = useCallback(async () => {
    if (!enabled) return;
    setIsSaving(true);
    try {
      await AsyncStorage.setItem(FORM_KEY, JSON.stringify(formData));
      await AsyncStorage.setItem(STEP_KEY, String(step));
      const session = await AsyncStorage.getItem(SESSION_KEY);
      if (session) {
        try {
          await leadService.saveDraft({
            sessionKey: session,
            formData,
            currentStep: step,
            loanType,
            applicationId,
            preferredBankId: formData.preferredBankId,
            loanPriority: formData.loanPriority,
          });
        } catch {
          /* server draft is best-effort */
        }
      }
      setLastSaved(new Date());
      onSaved?.();
    } finally {
      setIsSaving(false);
    }
  }, [formData, step, enabled, loanType, applicationId, onSaved]);

  useEffect(() => {
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!enabled || !hydrated.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(saveNow, DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [formData, step, enabled, saveNow]);

  return { isSaving, lastSaved, saveNow };
}

export async function ensureSessionKey(): Promise<string> {
  let session = await AsyncStorage.getItem(SESSION_KEY);
  if (!session) {
    session = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    await AsyncStorage.setItem(SESSION_KEY, session);
  }
  return session;
}

export async function loadDraftFromStorage<T>(): Promise<{ form: T | null; step: number; appId: string | null }> {
  const [saved, savedStep, appId] = await Promise.all([
    AsyncStorage.getItem(FORM_KEY),
    AsyncStorage.getItem(STEP_KEY),
    AsyncStorage.getItem('loan_assessment_application_id'),
  ]);
  return {
    form: saved ? JSON.parse(saved) : null,
    step: savedStep ? Number(savedStep) : 0,
    appId,
  };
}

export async function clearAssessmentDraft(): Promise<void> {
  await AsyncStorage.multiRemove([FORM_KEY, STEP_KEY, 'loan_assessment_application_id']);
}

export { FORM_KEY, STEP_KEY, SESSION_KEY };
