import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '@/src/theme';

type Props = {
  children: React.ReactNode;
  title?: string;
  loading?: boolean;
  scroll?: boolean;
  style?: ViewStyle;
  headerRight?: React.ReactNode;
  showBack?: boolean;
};

export default function Screen({
  children,
  title,
  loading,
  scroll = true,
  style,
  headerRight,
  showBack,
}: Props) {
  const content = loading ? (
    <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
  ) : (
    children
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {title || headerRight || showBack ? (
        <View style={styles.header}>
          {showBack ? (
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} accessibilityLabel="Go back">
              <Ionicons name="chevron-back" size={22} color={colors.foreground} />
            </TouchableOpacity>
          ) : null}
          {title ? <Text style={styles.title}>{title}</Text> : <View style={styles.titleSpacer} />}
          {headerRight}
        </View>
      ) : null}
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.scroll, style]}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        <View style={[styles.body, style]}>{content}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.foreground, flex: 1 },
  titleSpacer: { flex: 1 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  scroll: { padding: 16, paddingBottom: 32 },
  body: { flex: 1, padding: 16 },
  loader: { marginTop: 48 },
});
