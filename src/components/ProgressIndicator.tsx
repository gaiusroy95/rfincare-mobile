import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/src/theme';

type Step = { id: string; label: string };

type Props = {
  steps: Step[];
  currentStep: number;
};

export default function ProgressIndicator({ steps, currentStep }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        {steps.map((step, i) => (
          <View key={step.id} style={styles.segment}>
            <View style={[styles.dot, i <= currentStep && styles.dotActive]}>
              {i < currentStep ? <Text style={styles.check}>✓</Text> : (
                <Text style={[styles.num, i <= currentStep && styles.numActive]}>{i + 1}</Text>
              )}
            </View>
            {i < steps.length - 1 && (
              <View style={[styles.line, i < currentStep && styles.lineActive]} />
            )}
          </View>
        ))}
      </View>
      <Text style={styles.label}>
        Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  bar: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  segment: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: { backgroundColor: colors.primary },
  check: { color: '#fff', fontSize: 12, fontWeight: '700' },
  num: { fontSize: 11, color: colors.mutedForeground, fontWeight: '600' },
  numActive: { color: '#fff' },
  line: { flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: 2 },
  lineActive: { backgroundColor: colors.primary },
  label: { fontWeight: '600', color: colors.mutedForeground, fontSize: 13 },
});
