import { Alert, Linking } from 'react-native';
import { leadService } from '@/src/services/leadService';
import type { PostOfficeProduct } from '@/src/services/postOfficeService';
import type { MarketplaceProfile } from '@/src/utils/marketplaceLeadSession';

export function buildPostOfficeEligibilityData(product: PostOfficeProduct, profile: MarketplaceProfile = {}) {
  return {
    marketplaceType: 'post_office',
    productId: product.id,
    productName: product.name,
    providerName: product.providerName || 'India Post',
    applyUrl: product.applyUrl,
    categories: product.categories,
    interestRate: product.interestRate,
    calculatorType: product.calculatorType,
    taxBenefitsText: product.taxBenefitsText,
    returnsSummary: product.returnsSummary,
    ...profile,
  };
}

export async function recordPostOfficeApplicationLead(product: PostOfficeProduct, profile: MarketplaceProfile) {
  const eligibilityData = buildPostOfficeEligibilityData(product, profile);

  if (profile.leadId) {
    await leadService.updateLead(profile.leadId, {
      loanType: 'post_office',
      eligibilityData,
      status: 'application_started',
    });
    return profile.leadId;
  }

  const res = await leadService.createLead({
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    loanType: 'post_office',
    source: 'post_office_marketplace',
    consentAccepted: true,
    eligibilityData,
    status: 'application_started',
  });
  return res?.id || res?.lead?.id || null;
}

export async function openPostOfficeApplicationUrl(url?: string | null) {
  if (!url) {
    Alert.alert('Link unavailable', 'Purchase link is not available yet.');
    return false;
  }
  try {
    const ok = await Linking.canOpenURL(url);
    if (!ok) {
      Alert.alert('Cannot open link', 'This purchase link is not available.');
      return false;
    }
    await Linking.openURL(url);
    return true;
  } catch {
    Alert.alert('Cannot open link', 'This purchase link is not available.');
    return false;
  }
}

export async function completePostOfficeApply(product: PostOfficeProduct, profile: MarketplaceProfile) {
  if (!product.applyUrl) {
    await openPostOfficeApplicationUrl(null);
    return false;
  }

  try {
    await recordPostOfficeApplicationLead(product, profile);
  } catch {
    // Continue to purchase page even if lead recording fails.
  }

  return openPostOfficeApplicationUrl(product.applyUrl);
}
