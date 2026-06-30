export const APP_CONSENT_STORAGE_KEY = 'rfincare_app_install_consent';
export const APP_CONSENT_VERSION = '1';

export type AppConsentRecord = {
  version: string;
  acceptedAt: string;
  termsAccepted: boolean;
  contactConsentAccepted: boolean;
};
