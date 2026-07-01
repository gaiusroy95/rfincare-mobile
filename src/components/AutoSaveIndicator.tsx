import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '@/src/theme';

type Props = {
  isSaving?: boolean;
  lastSaved?: Date | null;
};

export default function AutoSaveIndicator({ isSaving, lastSaved }: Props) {
  if (!isSaving && !lastSaved) return null;

  const timeStr = lastSaved
    ? lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <View style={styles.wrap}>
      {isSaving ? (
        <>
          <ActivityIndicator size="small" color={colors.mutedForeground} />
          <Text style={styles.text}>Saving…</Text>
        </>
      ) : (
        <Text style={styles.text}>Saved at {timeStr}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  text: { fontSize: 12, color: colors.mutedForeground },
});
