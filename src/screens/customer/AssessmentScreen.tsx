import React, { useCallback, useEffect, useState } from 'react';
import { Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Screen from '@/src/components/Screen';
import CustomerHeaderActions from '@/src/components/customer/CustomerHeaderActions';
import ProgressIndicator from '@/src/components/ProgressIndicator';
import FormNavigation from '@/src/components/FormNavigation';
import AutoSaveIndicator from '@/src/components/AutoSaveIndicator';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import { colors } from '@/src/theme';
import { apiClient, setAccessToken } from '@/src/api/apiClient';
import { useAuth } from '@/src/contexts/AuthContext';
// @ts-expect-error JS module
import { leadService, ELIGIBILITY_SESSION_KEY } from '@/src/services/leadService';
// @ts-expect-error JS module
import { applicationService as appService } from '@/src/services/apiServices';
// @ts-expect-error JS module
import { applicationService } from '@/src/services/applicationService';
// @ts-expect-error JS module
import { agentApplicationService } from '@/src/services/agentApplicationService';
// @ts-expect-error JS module
import { buildAssessmentEntryState } from '@/src/utils/assessmentFormData';
// @ts-expect-error JS module
import { FINANCIAL_HISTORY_INITIAL, FINANCIAL_HISTORY_QUESTIONS } from '@/src/constants/assessmentFinancialHistory';
import {
  useAutoSave,
  ensureSessionKey,
  loadDraftFromStorage,
  clearAssessmentDraft,
  SESSION_KEY,
} from '@/src/hooks/useAutoSave';
import {
  generateCredentials,
  getStoredCredentials,
  persistCredentials,
} from '@/src/utils/assessmentCredentials';
import { hasCompletedEligibilityCheck } from '@/src/utils/eligibilityGate';
// @ts-expect-error JS module
import { homepageService } from '@/src/services/homepageService';
import {
  buildEligibilityInputFromAssessment,
  type EligibilityResult,
} from '@/src/utils/assessmentEligibility';
import { ASSESSMENT_STEPS, createInitialFormData, type AssessmentFormData } from './assessment/types';
import { validateStep } from './assessment/validation';
import { buildApplicationPayload } from './assessment/buildPayload';
import PersonalInfoForm from './assessment/PersonalInfoForm';
import AddressInfoForm from './assessment/AddressInfoForm';
import EmploymentInfoForm from './assessment/EmploymentInfoForm';
import FinancialInfoForm from './assessment/FinancialInfoForm';
import BankPreferencesStep from './assessment/BankPreferencesStep';
import ReviewSubmitForm from './assessment/ReviewSubmitForm';
import DocumentUploadStep from './assessment/DocumentUploadStep';
import ConsentSignatureForm from './assessment/ConsentSignatureForm';
import ApplicationConfirmation from './assessment/ApplicationConfirmation';
import AgentAssistedBanner from './assessment/AgentAssistedBanner';

type Props = { assistedByAgent?: boolean };

export default function AssessmentScreen({ assistedByAgent = false }: Props) {
  const params = useLocalSearchParams<{ loanType?: string; resume?: string }>();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<AssessmentFormData>(createInitialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [appId, setAppId] = useState('');
  const [loading, setLoading] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
  const [agentMeta, setAgentMeta] = useState<Record<string, unknown> | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [gateReady, setGateReady] = useState(Boolean(assistedByAgent || params.resume === '1'));

  const { isSaving, lastSaved, saveNow } = useAutoSave({
    formData: form,
    step,
    loanType: params.loanType,
    applicationId: appId,
  });

  const update = useCallback((key: keyof AssessmentFormData, value: unknown) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const hydrate = useCallback(async () => {
    await ensureSessionKey();
    const { form: saved, step: savedStep, appId: savedApp } = await loadDraftFromStorage<AssessmentFormData>();

    let merged = createInitialFormData();
    if (params.resume === '1' && saved) {
      merged = { ...merged, ...saved };
      setStep(savedStep);
      if (savedApp) setAppId(savedApp);
      try {
        const session = await AsyncStorage.getItem(SESSION_KEY);
        if (session) {
          const draft = await leadService.getDraft(session);
          if (draft?.formData) merged = { ...merged, ...draft.formData };
          if (draft?.currentStep != null) setStep(draft.currentStep);
        }
      } catch { /* */ }
    } else if (!params.resume) {
      // Prefill from the eligibility check the customer just completed.
      let eligibilityFormData: Record<string, unknown> | null = null;
      try {
        const stored = await AsyncStorage.getItem(ELIGIBILITY_SESSION_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          eligibilityFormData = parsed?.formData || parsed?.payload?.formData || null;
        }
      } catch { /* ignore */ }

      const entry = buildAssessmentEntryState({
        initialFormData: createInitialFormData(),
        financialHistoryInitial: FINANCIAL_HISTORY_INITIAL,
        financialHistoryQuestions: FINANCIAL_HISTORY_QUESTIONS,
        locationState: { loanType: params.loanType },
        searchParams: { get: (k: string) => (k === 'loanType' ? params.loanType || null : null) },
        sessionFormData: eligibilityFormData,
      });
      merged = { ...merged, ...entry };
    }

    if (isAuthenticated && user) {
      merged.email = merged.email || user.email || '';
      merged.phone = merged.phone || user.phone || '';
      merged.firstName = merged.firstName || user.firstName || '';
      merged.lastName = merged.lastName || user.lastName || '';
    }

    setForm(merged);
  }, [params.resume, params.loanType, isAuthenticated, user]);

  useEffect(() => {
    if (assistedByAgent || params.resume === '1') {
      setGateReady(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const ok = await hasCompletedEligibilityCheck();
      if (cancelled) return;
      if (!ok) {
        router.replace({
          pathname: '/(customer)/eligibility',
          params: params.loanType ? { loanType: String(params.loanType) } : undefined,
        });
        return;
      }
      setGateReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [assistedByAgent, params.resume, params.loanType]);

  useEffect(() => {
    if (!gateReady) return;
    hydrate();
    if (assistedByAgent) {
      agentApplicationService.getProfile().then(setAgentMeta).catch(() => {});
    }
  }, [gateReady, hydrate, assistedByAgent]);

  const fetchEligibility = useCallback(async (formData: AssessmentFormData) => {
    try {
      const res = await homepageService.calculateEligibility(
        buildEligibilityInputFromAssessment(formData as unknown as Record<string, unknown>),
      );
      setEligibilityResult(res);
      return res;
    } catch {
      return null;
    }
  }, []);

  const authenticateApplicant = async (): Promise<string> => {
    if (isAuthenticated && user?.id) return user.id;

    const email = form.email.trim().toLowerCase();
    if (!email) {
      const err = new Error('Email is required. Go back to Personal details and enter your email.');
      throw err;
    }

    // Use the same credential scheme as the website so accounts are shared
    // across web and app. Prefer previously stored credentials for this phone.
    const stored = await getStoredCredentials({ phone: form.phone });
    const generated = generateCredentials({ firstName: form.firstName, phone: form.phone });
    const password = stored?.password || generated.password;

    try {
      const res = await apiClient.post('/auth/signup', {
        email,
        password,
        fullName: `${form.firstName} ${form.lastName}`.trim(),
        phone: form.phone,
        role: 'customer',
      });
      await setAccessToken(res.data?.accessToken);
      await persistCredentials({ username: generated.username, password }, form.phone);
      return res.data?.user?.id;
    } catch (signupErr: unknown) {
      const status = (signupErr as { response?: { status?: number } })?.response?.status;
      if (status !== 409) throw signupErr;
      // Try the current scheme, then the legacy mobile scheme for older accounts.
      const candidates = [password];
      const legacy = `${form.phone}@Rfincare`;
      if (legacy !== password) candidates.push(legacy);
      for (const candidate of candidates) {
        try {
          const loginRes = await apiClient.post('/auth/login', { email, password: candidate });
          await setAccessToken(loginRes.data?.accessToken);
          await persistCredentials({ username: generated.username, password: candidate }, form.phone);
          return loginRes.data?.user?.id;
        } catch {
          /* try next candidate */
        }
      }
      // Account exists with a different password (e.g. set manually or via a
      // social login). Don't surface the raw "Invalid email or password".
      throw new Error(
        'An account already exists for this email. Please sign in from Profile → Login (or use a different email), then continue your application.',
      );
    }
  };

  const ensureDraft = async (customerId: string): Promise<string> => {
    setPreparing(true);
    try {
      const payload = buildApplicationPayload(form, customerId, 'draft');
      if (assistedByAgent) {
        if (appId) {
          await agentApplicationService.updateApplication(appId, payload);
          return appId;
        }
        const app = await agentApplicationService.createApplication({ ...payload, customerId });
        const id = app?.id;
        if (!id) throw new Error('Could not create application draft.');
        setAppId(id);
        await AsyncStorage.setItem('loan_assessment_application_id', id);
        return id;
      }
      if (appId) {
        await appService.updateApplication(appId, payload);
        return appId;
      }
      const app = await appService.createApplication(payload);
      const id = app?.id;
      if (!id) throw new Error('Could not create application draft.');
      setAppId(id);
      await AsyncStorage.setItem('loan_assessment_application_id', id);
      return id;
    } finally {
      setPreparing(false);
    }
  };

  const handleNext = async () => {
    const stepErrors = validateStep(step, form);
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setSubmitError('');

    if (step === 5) {
      setLoading(true);
      try {
        const customerId = await authenticateApplicant();
        await ensureDraft(customerId);
        await fetchEligibility(form);
        setStep(6);
        await saveNow();
      } catch (e: unknown) {
        const msg = (e as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error
          || (e as Error).message
          || 'Could not create your account.';
        setSubmitError(msg);
      }
      setLoading(false);
      return;
    }

    if (step === ASSESSMENT_STEPS.length - 1) {
      await handleFinalSubmit();
      return;
    }

    setStep((s) => s + 1);
  };

  const handleFinalSubmit = async () => {
    if (!form.consentSignatureAgreed) {
      Alert.alert('Consent required', 'Please agree to consent terms before submitting.');
      return;
    }
    if (!form.otpVerified) {
      Alert.alert('Verification required', 'Please verify via OTP or signature.');
      return;
    }

    setLoading(true);
    setSubmitError('');
    try {
      const customerId = await authenticateApplicant();
      let id = appId || await ensureDraft(customerId);

      const signatureName = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(' ');
      const signaturePayload = form.submitAuthMethod === 'otp'
        ? { customerSignature: 'OTP_VERIFIED', signatureMethod: 'otp', signatureSignedAt: new Date().toISOString(), signatureName }
        : { customerSignature: form.customerSignature, signatureMethod: form.signatureMode || 'draw', signatureSignedAt: new Date().toISOString(), signatureName };

      const finalPayload = {
        ...buildApplicationPayload(form, customerId, 'documents_pending'),
        ...signaturePayload,
      };

      if (assistedByAgent) {
        await agentApplicationService.updateApplication(id, finalPayload);
        await agentApplicationService.submitApplication(id);
        await clearAssessmentDraft();
        router.replace('/(agent)/(tabs)/dashboard');
        return;
      }

      await appService.updateApplication(id, finalPayload);
      const consentResult = await applicationService.saveConsents(id, {
        certify_accuracy: form.certifyAccuracy,
        authorize_credit: form.authorizeCredit,
        agree_terms: form.agreeTerms,
        consent_communications: form.consentCommunications,
        electronic_signature: form.consentSignatureAgreed,
      });
      if (consentResult?.error) throw new Error(consentResult.error.message);

      const submitResult = await applicationService.submitApplication(id);
      if (submitResult?.error) throw new Error(submitResult.error.message);

      await fetchEligibility(form);
      await clearAssessmentDraft();
      setSubmitted(true);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error
        || (e as Error).message
        || 'Submit failed';
      setSubmitError(msg);
      Alert.alert('Error', msg);
    }
    setLoading(false);
  };

  const renderStep = () => {
    if (submitted) {
      return (
        <ApplicationConfirmation
          applicationId={appId}
          loanPurpose={form.loanPurpose}
          eligibilityResult={eligibilityResult}
          onDone={() => router.replace('/(customer)/(tabs)/dashboard')}
        />
      );
    }
    switch (step) {
      case 0: return <PersonalInfoForm form={form} errors={errors} onChange={update} />;
      case 1: return <AddressInfoForm form={form} errors={errors} onChange={update} />;
      case 2: return <EmploymentInfoForm form={form} errors={errors} onChange={update} />;
      case 3: return <FinancialInfoForm form={form} errors={errors} onChange={update} />;
      case 4: return <BankPreferencesStep form={form} errors={errors} onChange={update} />;
      case 5: return <ReviewSubmitForm form={form} errors={errors} onChange={update} />;
      case 6: return <DocumentUploadStep form={form} applicationId={appId} eligibilityResult={eligibilityResult} />;
      case 7: return (
        <ConsentSignatureForm
          form={form}
          applicationId={appId}
          eligibilityResult={eligibilityResult}
          onChange={update}
          onVerified={() => update('otpVerified', true)}
        />
      );
      default: return null;
    }
  };

  if (!gateReady) {
    return (
      <Screen title="Loan Application" loading headerRight={<CustomerHeaderActions />} />
    );
  }

  if (submitted) {
    return (
      <Screen title="Application Submitted" headerRight={<CustomerHeaderActions />}>
        {renderStep()}
      </Screen>
    );
  }

  return (
    <Screen
      showBack
      onBack={() => {
        if (step > 0) {
          setErrors({});
          setStep((s) => s - 1);
        } else {
          router.back();
        }
      }}
      title={assistedByAgent ? `Agent Application — ${ASSESSMENT_STEPS[step].label}` : `Apply — ${ASSESSMENT_STEPS[step].label}`}
      headerRight={<CustomerHeaderActions />}
    >
      <LoadingOverlay visible={preparing} message="Preparing your application…" />
      {assistedByAgent && agentMeta && (
        <AgentAssistedBanner
          agentCode={String(agentMeta.agentCode || '')}
          fullName={String(agentMeta.fullName || '')}
        />
      )}
      <ProgressIndicator steps={ASSESSMENT_STEPS} currentStep={step} />
      <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
      {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
      {renderStep()}
      {!submitted && (
        <FormNavigation
          showBack={step > 0}
          onBack={() => { setErrors({}); setStep((s) => s - 1); }}
          onNext={handleNext}
          onSave={saveNow}
          nextLabel={step === ASSESSMENT_STEPS.length - 1 ? 'Submit Application' : step === 5 ? 'Continue to Documents' : 'Continue'}
          loading={loading}
          variant={assistedByAgent ? 'agent' : 'customer'}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.destructive, marginBottom: 8, fontSize: 13 },
});
