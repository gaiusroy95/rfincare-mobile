import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Screen from '@/src/components/Screen';
// @ts-expect-error JS module
import { homepageService } from '@/src/services/homepageService';

export default function LegalScreen() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const [page, setPage] = useState<Record<string, unknown>>({});

  useEffect(() => {
    homepageService.getLegalPage(slug || 'terms').then(setPage).catch(() => {});
  }, [slug]);

  return (
    <Screen title={String(page?.title || 'Legal')}>
      <Text style={styles.body}>{String(page?.content || page?.body || '')}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 14, lineHeight: 22 },
});
