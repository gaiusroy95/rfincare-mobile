import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '@/src/components/Button';
import { colors } from '@/src/theme';

type Props = {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({ title, message, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} variant="outline" onPress={onAction} style={styles.btn} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 16 },
  title: { fontSize: 16, fontWeight: '600', color: colors.foreground, textAlign: 'center' },
  message: { fontSize: 14, color: colors.mutedForeground, textAlign: 'center', marginTop: 8 },
  btn: { marginTop: 16, minWidth: 160 },
});
