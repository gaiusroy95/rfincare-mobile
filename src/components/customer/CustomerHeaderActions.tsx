import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '@/src/theme';
import { SidebarToggle } from '@/src/components/customer/CustomerSidebar';

type Props = {
  showProfile?: boolean;
  showSettings?: boolean;
  showMenu?: boolean;
};

export default function CustomerHeaderActions({
  showProfile = true,
  showSettings = true,
  showMenu = true,
}: Props) {
  return (
    <View style={styles.row}>
      {showMenu ? <SidebarToggle /> : null}
      {showProfile ? (
        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push('/(customer)/(tabs)/profile')}
          accessibilityLabel="Profile"
        >
          <Ionicons name="person-circle-outline" size={22} color={colors.foreground} />
        </TouchableOpacity>
      ) : null}
      {showSettings ? (
        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push('/(customer)/settings')}
          accessibilityLabel="Settings"
        >
          <Ionicons name="settings-outline" size={20} color={colors.foreground} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
