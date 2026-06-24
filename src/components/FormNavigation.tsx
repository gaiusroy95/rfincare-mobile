import React from 'react';
import { View, StyleSheet } from 'react-native';
import Button from '@/src/components/Button';

type Props = {
  onBack?: () => void;
  onNext: () => void;
  onSave?: () => void;
  nextLabel?: string;
  loading?: boolean;
  nextDisabled?: boolean;
  variant?: 'customer' | 'agent' | 'primary';
  showBack?: boolean;
};

export default function FormNavigation({
  onBack,
  onNext,
  onSave,
  nextLabel = 'Continue',
  loading,
  nextDisabled,
  variant = 'customer',
  showBack = true,
}: Props) {
  return (
    <View style={styles.wrap}>
      {onSave && (
        <Button title="Save progress" variant="outline" onPress={onSave} style={styles.save} />
      )}
      <View style={styles.row}>
        {showBack && onBack && (
          <Button title="Back" variant="outline" onPress={onBack} style={styles.back} />
        )}
        <Button
          title={nextLabel}
          onPress={onNext}
          loading={loading}
          disabled={nextDisabled}
          variant={variant}
          style={styles.next}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 16 },
  save: { marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8 },
  back: { flex: 1 },
  next: { flex: 2 },
});
