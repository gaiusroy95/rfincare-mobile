import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Card from '@/src/components/Card';
import Button from '@/src/components/Button';
import EligibilityResultSummary from '@/src/components/assessment/EligibilityResultSummary';
import { colors } from '@/src/theme';
import type { EligibilityResult } from '@/src/utils/assessmentEligibility';

type Props = {
  applicationId: string;
  eligibilityResult?: EligibilityResult | null;
  onDone: () => void;
};

export default function ApplicationConfirmation({ applicationId, eligibilityResult, onDone }: Props) {
  return (
    <>
      <EligibilityResultSummary result={eligibilityResult ?? null} />
      <Card>
        <Text style={styles.title}>Application submitted!</Text>
        <Text style={styles.body}>
          Your loan application has been submitted successfully. Reference: {applicationId}
        </Text>
        <Text style={styles.body}>
          You will receive updates on your registered email and phone. Track status in your dashboard.
        </Text>
        <Button title="Go to Dashboard" variant="customer" onPress={onDone} style={{ marginTop: 16 }} />
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '700', color: colors.success, marginBottom: 12 },
  body: { fontSize: 14, color: colors.mutedForeground, marginBottom: 8, lineHeight: 20 },
});
