import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
// @ts-expect-error JS module
import { ELIGIBILITY_SESSION_KEY } from '@/src/services/leadService';

export type AssessmentNavParams = {
  loanType?: string;
  resume?: string;
};

/** True when the customer has completed the standalone eligibility check. */
export async function hasCompletedEligibilityCheck(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(ELIGIBILITY_SESSION_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.result || parsed?.payload);
  } catch {
    return false;
  }
}

/** Navigate to assessment only after eligibility; otherwise send to eligibility first. */
export async function openAssessmentOrEligibilityFirst(
  params?: AssessmentNavParams,
  options?: { bypass?: boolean },
): Promise<void> {
  if (options?.bypass || params?.resume === '1') {
    router.push({ pathname: '/(customer)/assessment', params: params as never });
    return;
  }

  const completed = await hasCompletedEligibilityCheck();
  if (completed) {
    router.push({ pathname: '/(customer)/assessment', params: params as never });
    return;
  }

  router.push({
    pathname: '/(customer)/eligibility',
    params: params?.loanType ? { loanType: params.loanType } : undefined,
  } as never);
}
