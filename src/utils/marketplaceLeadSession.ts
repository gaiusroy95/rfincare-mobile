import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_PREFIX = 'rfincare_marketplace_profile_';

export type MarketplaceProfile = {
  leadId?: string;
  verifiedAt?: number;
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  occupation?: string;
  annualIncome?: string;
  education?: string;
  tobaccoUse?: string;
  tobaccoFrequency?: string | null;
  alcoholUse?: string;
  alcoholFrequency?: string | null;
  productCategory?: string;
  productSegment?: string | null;
  productLabel?: string;
  marketplaceType?: string;
};

function getKey(marketplaceType: string) {
  return `${SESSION_PREFIX}${marketplaceType}`;
}

export async function loadMarketplaceProfile(marketplaceType: string): Promise<MarketplaceProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(getKey(marketplaceType));
    if (!raw) return null;
    const data = JSON.parse(raw) as MarketplaceProfile;
    if (!data?.verifiedAt || !data?.phone || !data?.email) return null;
    return data;
  } catch {
    return null;
  }
}

export async function saveMarketplaceProfile(
  marketplaceType: string,
  profile: MarketplaceProfile,
): Promise<MarketplaceProfile> {
  const payload: MarketplaceProfile = {
    ...profile,
    marketplaceType,
    verifiedAt: profile.verifiedAt || Date.now(),
  };
  await AsyncStorage.setItem(getKey(marketplaceType), JSON.stringify(payload));
  return payload;
}
