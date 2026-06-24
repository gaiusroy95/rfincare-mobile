import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import Screen from '@/src/components/Screen';
import CustomerHeaderActions from '@/src/components/customer/CustomerHeaderActions';
// @ts-expect-error JS module
import { homepageService } from '@/src/services/homepageService';

export default function AboutScreen() {
  const [content, setContent] = useState<Record<string, unknown>>({});

  useEffect(() => {
    homepageService.getAboutContent().then(setContent).catch(() => {});
  }, []);

  return (
    <Screen title="About Us" showBack headerRight={<CustomerHeaderActions />}>
      <Text style={styles.title}>{String(content?.headline || 'About Rfincare')}</Text>
      <Text style={styles.body}>{String(content?.body || content?.description || 'Rfincare helps you find the best loan offers from partner banks across India.')}</Text>
      {(content?.sections as { title?: string; content?: string }[] || []).map((s, i) => (
        <Text key={i} style={styles.section}>
          <Text style={styles.sectionTitle}>{s.title}{'\n'}</Text>
          {s.content}
        </Text>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  body: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  section: { marginBottom: 12, lineHeight: 20 },
  sectionTitle: { fontWeight: '600' },
});
