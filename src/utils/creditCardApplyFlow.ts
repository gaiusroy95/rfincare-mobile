import { Alert, Linking } from 'react-native';
import { leadService } from '@/src/services/leadService';
import type { CreditCard } from '@/src/services/creditCardService';
import type { MarketplaceProfile } from '@/src/utils/marketplaceLeadSession';

export function buildCreditCardEligibilityData(card: CreditCard, profile: MarketplaceProfile = {}) {
  return {
    marketplaceType: 'credit_card',
    productId: card.id,
    productName: card.name,
    bankName: card.bankName,
    applyUrl: card.applyUrl,
    categories: card.categories,
    annualFee: card.annualFee,
    joiningFee: card.joiningFee,
    cardNetwork: card.cardNetwork,
    ...profile,
  };
}

export async function recordCreditCardApplicationLead(card: CreditCard, profile: MarketplaceProfile) {
  const eligibilityData = buildCreditCardEligibilityData(card, profile);

  if (profile.leadId) {
    await leadService.updateLead(profile.leadId, {
      loanType: 'credit_card',
      eligibilityData,
      status: 'application_started',
    });
    return profile.leadId;
  }

  const res = await leadService.createLead({
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    loanType: 'credit_card',
    source: 'credit_card_marketplace',
    consentAccepted: true,
    eligibilityData,
    status: 'application_started',
  });
  return res?.id || res?.lead?.id || null;
}

export async function openCreditCardApplicationUrl(url?: string | null) {
  if (!url) {
    Alert.alert('Apply link unavailable', 'This card does not have a bank apply link yet.');
    return false;
  }
  try {
    const ok = await Linking.canOpenURL(url);
    if (!ok) {
      Alert.alert('Cannot open link', 'This apply link is not available.');
      return false;
    }
    await Linking.openURL(url);
    return true;
  } catch {
    Alert.alert('Cannot open link', 'This apply link is not available.');
    return false;
  }
}

export async function completeCreditCardApply(card: CreditCard, profile: MarketplaceProfile) {
  if (!card.applyUrl) {
    await openCreditCardApplicationUrl(null);
    return false;
  }

  try {
    await recordCreditCardApplicationLead(card, profile);
  } catch {
    // Continue to bank even if lead recording fails.
  }

  return openCreditCardApplicationUrl(card.applyUrl);
}
