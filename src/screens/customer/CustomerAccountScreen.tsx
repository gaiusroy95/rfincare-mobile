import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Screen from '@/src/components/Screen';
import CustomerHeaderActions from '@/src/components/customer/CustomerHeaderActions';
import { useAuth } from '@/src/contexts/AuthContext';
import { colors } from '@/src/theme';

type LinkItem = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
  requiresAuth?: boolean;
};

const ACCOUNT_LINKS: LinkItem[] = [
  { title: 'Edit Profile', icon: 'person-outline', href: '/(customer)/profile', requiresAuth: true },
  { title: 'Documents', icon: 'folder-open-outline', href: '/(customer)/documents', requiresAuth: true },
  { title: 'Password Management', icon: 'key-outline', href: '/(customer)/password', requiresAuth: true },
  { title: 'Bank Selection & Consent', icon: 'business-outline', href: '/(customer)/bank-selection', requiresAuth: true },
  { title: 'Additional Questionnaire', icon: 'clipboard-outline', href: '/(customer)/questionnaire', requiresAuth: true },
  { title: 'Auth Center', icon: 'shield-outline', href: '/(customer)/auth-center', requiresAuth: true },
];

const SUPPORT_LINKS: LinkItem[] = [
  { title: 'Share Your Story', icon: 'megaphone-outline', href: '/(customer)/share-story' },
  { title: 'Terms of Service', icon: 'document-text-outline', href: '/(customer)/legal?slug=terms' },
  { title: 'Privacy Policy', icon: 'lock-closed-outline', href: '/(customer)/legal?slug=privacy' },
];

function LinkSection({ title, items, isLoggedIn }: { title: string; items: LinkItem[]; isLoggedIn: boolean }) {
  const visible = items.filter((item) => !item.requiresAuth || isLoggedIn);
  if (!visible.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {visible.map((item) => (
        <TouchableOpacity
          key={item.href}
          style={styles.row}
          onPress={() => router.push(item.href as never)}
        >
          <Ionicons name={item.icon} size={20} color={colors.customer} />
          <Text style={styles.link}>{item.title}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function CustomerAccountScreen() {
  const { user, userProfile, signOut } = useAuth();
  const displayName = userProfile?.fullName || user?.firstName || user?.email || 'Guest';

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <Screen
      title="Profile"
      headerRight={<CustomerHeaderActions showProfile={false} />}
    >
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color={colors.customer} />
        </View>
        <View style={styles.profileText}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{user?.email || 'Sign in to manage your account'}</Text>
        </View>
      </View>

      {!user ? (
        <View style={styles.authRow}>
          <TouchableOpacity style={styles.authBtn} onPress={() => router.push('/(customer)/login')}>
            <Text style={styles.authBtnText}>Customer Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.authBtn, styles.authBtnOutline]}
            onPress={() => router.push('/(customer)/register')}
          >
            <Text style={[styles.authBtnText, styles.authBtnTextOutline]}>Register</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <LinkSection title="Account" items={ACCOUNT_LINKS} isLoggedIn={!!user} />
      <LinkSection title="Support & Legal" items={SUPPORT_LINKS} isLoggedIn={!!user} />

      {user ? (
        <TouchableOpacity style={styles.signOut} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.signOut} onPress={() => router.push('/')}>
          <Ionicons name="swap-horizontal-outline" size={20} color={colors.mutedForeground} />
          <Text style={styles.switchRole}>Switch Role</Text>
        </TouchableOpacity>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.customer}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileText: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  email: { fontSize: 13, color: colors.mutedForeground, marginTop: 4 },
  authRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  authBtn: {
    flex: 1,
    backgroundColor: colors.customer,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  authBtnOutline: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.customer,
  },
  authBtnText: { color: '#fff', fontWeight: '700' },
  authBtnTextOutline: { color: colors.customer },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.mutedForeground,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  link: { flex: 1, fontSize: 16, color: colors.foreground },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    paddingVertical: 14,
  },
  signOutText: { fontSize: 16, color: colors.destructive, fontWeight: '600' },
  switchRole: { fontSize: 16, color: colors.mutedForeground, fontWeight: '600' },
});
