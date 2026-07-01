import AsyncStorage from '@react-native-async-storage/async-storage';

export const MARKETPLACE_COMPARE_KEY = 'rfincare_marketplace_compare';

export async function saveCompareSelection(compareIds: string[], loanCategory: string): Promise<void> {
  await AsyncStorage.setItem(
    MARKETPLACE_COMPARE_KEY,
    JSON.stringify({ compareIds, loanCategory }),
  );
}

export async function loadCompareSelection(): Promise<{ compareIds: string[]; loanCategory: string }> {
  try {
    const raw = await AsyncStorage.getItem(MARKETPLACE_COMPARE_KEY);
    if (!raw) return { compareIds: [], loanCategory: 'personal_loan' };
    const parsed = JSON.parse(raw);
    return {
      compareIds: Array.isArray(parsed?.compareIds) ? parsed.compareIds : [],
      loanCategory: String(parsed?.loanCategory || 'personal_loan'),
    };
  } catch {
    return { compareIds: [], loanCategory: 'personal_loan' };
  }
}
