import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Card from '@/src/components/Card';
import { colors } from '@/src/theme';

type Props = {
  agentCode?: string;
  fullName?: string;
};

export default function AgentAssistedBanner({ agentCode, fullName }: Props) {
  return (
    <Card>
      <Text style={styles.label}>Agent-assisted application</Text>
      <Text style={styles.text}>Agent: {agentCode || '—'} — {fullName || 'Agent'}</Text>
      <Text style={styles.hint}>This application is being filed on behalf of the customer.</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '700', color: colors.agent, marginBottom: 4 },
  text: { color: colors.foreground },
  hint: { fontSize: 12, color: colors.mutedForeground, marginTop: 4 },
});
