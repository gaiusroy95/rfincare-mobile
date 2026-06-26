import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Deterministic applicant credentials for the self-serve loan assessment.
 * MUST match the website (frontend customer-assessment-portal) so an account
 * created on one platform can be reused on the other.
 *   username: <firstname><last4phone>
 *   password: RFC<last4phone><FIRST4NAME>!
 */
export const CREDENTIALS_KEY = 'loan_assessment_credentials';

export type AssessmentCredentials = {
  username: string;
  password: string;
  phone?: string;
};

export function generateCredentials(form: { firstName?: string; phone?: string }): AssessmentCredentials {
  const firstName = (form?.firstName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
  const phone = (form?.phone || '').replace(/[^0-9]/g, '').slice(-4) || '0000';
  const username = `${firstName}${phone}`;
  const password = `RFC${phone}${firstName.slice(0, 4).toUpperCase()}!`;
  return { username, password };
}

export async function getStoredCredentials(form: { phone?: string }): Promise<AssessmentCredentials | null> {
  try {
    const raw = await AsyncStorage.getItem(CREDENTIALS_KEY);
    const stored = raw ? (JSON.parse(raw) as AssessmentCredentials) : null;
    if (stored?.phone && stored.phone === form?.phone) return stored;
  } catch {
    /* ignore */
  }
  return null;
}

export async function persistCredentials(creds: AssessmentCredentials, phone?: string) {
  try {
    await AsyncStorage.setItem(CREDENTIALS_KEY, JSON.stringify({ ...creds, phone }));
  } catch {
    /* ignore */
  }
}
