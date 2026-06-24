import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import Screen from '@/src/components/Screen';
import LanguageSwitcher from '@/src/components/LanguageSwitcher';
import { useAuth } from '@/src/contexts/AuthContext';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { notificationService } from '@/src/services/notificationService';
import { requestPushPermissions, isPushAvailable } from '@/src/services/pushNotificationService';
import { colors } from '@/src/theme';

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
  const { user } = useAuth();
  const { refreshPushRegistration, pushAvailable } = useNotifications();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(true);

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
        <LanguageSwitcher />
        <View style={styles.versionRow}>
          <Text style={styles.versionLabel}>App version</Text>
          <Text style={styles.versionValue}>{Constants.expoConfig?.version || '1.0.0'}</Text>
        </View>
        <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/')}>
          <Text style={styles.linkText}>Switch role</Text>
        </TouchableOpacity>
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
  linkRow: { paddingVertical: 14 },
  linkText: { fontSize: 15, fontWeight: '600', color: colors.customer },
});
