import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import Screen from '@/src/components/Screen';
import { useAuth } from '@/src/contexts/AuthContext';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { notificationService } from '@/src/services/notificationService';
import { requestPushPermissions, isPushAvailable } from '@/src/services/pushNotificationService';
import i18n from '@/src/i18n';
// @ts-expect-error JS module
import { LANGUAGE_CODES } from '@/src/i18n/languages';
import { colors } from '@/src/theme';

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  hi: 'हिन्दी',
  bn: 'বাংলা',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  mr: 'मराठी',
  gu: 'ગુજરાતી',
  kn: 'ಕನ್ನಡ',
};

type ToggleRowProps = {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function ToggleRow({ label, description, value, onValueChange }: ToggleRowProps) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleText}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.customer }}
        thumbColor="#fff"
      />
    </View>
  );
}

export default function CustomerSettingsScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { refreshPushRegistration, pushAvailable } = useNotifications();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [languageOpen, setLanguageOpen] = useState(false);

  const currentLang = i18n.language?.split('-')[0] || 'en';

  useEffect(() => {
    if (!user) return;
    notificationService
      .getPreferences()
      .then((prefs) => {
        if (prefs?.push != null) setPushEnabled(prefs.push);
        if (prefs?.email != null) setEmailEnabled(prefs.email);
        if (prefs?.marketing != null) setMarketingEnabled(prefs.marketing);
        if (prefs?.sms != null) setSmsEnabled(prefs.sms);
      })
      .catch(() => {});
  }, [user]);

  const savePref = async (patch: {
    push?: boolean;
    email?: boolean;
    marketing?: boolean;
    sms?: boolean;
  }) => {
    if (!user) return;
    try {
      await notificationService.savePreferences(patch);
      if (patch.push) await refreshPushRegistration();
    } catch {
      Alert.alert('Could not save', 'Notification preference sync failed. Try again.');
    }
  };

  return (
    <Screen title="Settings" showBack>
      <Text style={styles.sectionTitle}>Notifications</Text>
      {!pushAvailable ? (
        <Text style={styles.hint}>
          Push alerts require a preview/production app build. In Expo Go, in-app notifications still sync from the portal on Dashboard.
        </Text>
      ) : null}
      <View style={styles.card}>
        {user ? (
          <>
        {pushAvailable ? (
        <ToggleRow
          label="Push notifications"
          description="Instant alerts for application and eligibility updates"
          value={pushEnabled}
          onValueChange={async (value) => {
            if (value) {
              const granted = await requestPushPermissions();
              if (!granted) {
                Alert.alert('Permission needed', 'Enable notifications in device settings to receive push alerts.');
                return;
              }
            }
            setPushEnabled(value);
            await savePref({ push: value });
          }}
        />
        ) : null}
        <ToggleRow
          label="Email notifications"
          description="Important updates sent to your registered email"
          value={emailEnabled}
          onValueChange={(value) => {
            setEmailEnabled(value);
            savePref({ email: value });
          }}
        />
        <ToggleRow
          label="SMS notifications"
          description="Fallback text alerts when push is unavailable"
          value={smsEnabled}
          onValueChange={(value) => {
            setSmsEnabled(value);
            savePref({ sms: value });
          }}
        />
        <ToggleRow
          label="Offers & tips"
          description="Product news and loan tips from rfincare"
          value={marketingEnabled}
          onValueChange={(value) => {
            setMarketingEnabled(value);
            savePref({ marketing: value });
          }}
        />
          </>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>App</Text>
      <View style={styles.card}>
        <View style={styles.versionRow}>
          <Text style={styles.versionLabel}>App version</Text>
          <Text style={styles.versionValue}>{Constants.expoConfig?.version || '1.0.0'}</Text>
        </View>
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setLanguageOpen((open) => !open)}
          activeOpacity={0.85}
        >
          <Text style={styles.langBtnText}>
            {t('common.changeLanguage', 'Change language')}
          </Text>
          <Text style={styles.langBtnCurrent}>{LANGUAGE_LABELS[currentLang] || currentLang}</Text>
        </TouchableOpacity>
        {languageOpen ? (
          <View style={styles.langList}>
            {(LANGUAGE_CODES as string[]).map((code) => (
              <TouchableOpacity
                key={code}
                style={[styles.langOption, code === currentLang && styles.langOptionActive]}
                onPress={() => {
                  i18n.changeLanguage(code);
                  setLanguageOpen(false);
                }}
              >
                <Text style={[styles.langOptionText, code === currentLang && styles.langOptionTextActive]}>
                  {LANGUAGE_LABELS[code] || code}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.mutedForeground,
    marginBottom: 8,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hint: {
    fontSize: 12,
    color: colors.mutedForeground,
    lineHeight: 17,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toggleText: { flex: 1 },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: colors.foreground },
  toggleDesc: { fontSize: 12, color: colors.mutedForeground, marginTop: 4, lineHeight: 16 },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  versionLabel: { fontSize: 15, fontWeight: '600', color: colors.foreground },
  versionValue: { fontSize: 14, color: colors.mutedForeground },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    gap: 12,
  },
  langBtnText: { fontSize: 15, fontWeight: '600', color: colors.customer },
  langBtnCurrent: { fontSize: 14, color: colors.mutedForeground },
  langList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 8,
  },
  langOption: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  langOptionActive: { backgroundColor: `${colors.customer}12` },
  langOptionText: { fontSize: 15, color: colors.foreground },
  langOptionTextActive: { fontWeight: '700', color: colors.customer },
});
