import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';
import Screen from '@/src/components/Screen';
import { colors } from '@/src/theme';
// @ts-expect-error JS module
import { homepageService } from '@/src/services/homepageService';
// @ts-expect-error JS module
import { prepareLegalHtml } from '@/src/utils/legalContent';

const SLUG_ALIASES: Record<string, string> = {
  terms: 'terms-of-service',
  'terms-of-service': 'terms-of-service',
  privacy: 'privacy-policy',
  'privacy-policy': 'privacy-policy',
  cookie: 'cookie-policy',
  'cookie-policy': 'cookie-policy',
};

function buildHtmlDocument(bodyHtml: string) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 16px 18px 32px;
    font-family: -apple-system, system-ui, "Segoe UI", Roboto, sans-serif;
    color: ${colors.foreground};
    background: ${colors.background};
    font-size: 15px;
    line-height: 1.6;
    -webkit-text-size-adjust: 100%;
  }
  h1 { font-size: 22px; margin: 18px 0 10px; }
  h2 { font-size: 18px; margin: 18px 0 8px; }
  h3 { font-size: 16px; margin: 14px 0 6px; }
  p { margin: 0 0 12px; color: ${colors.mutedForeground}; }
  ul, ol { margin: 0 0 12px; padding-left: 20px; color: ${colors.mutedForeground}; }
  li { margin-bottom: 6px; }
  a { color: ${colors.customer}; }
  strong { color: ${colors.foreground}; }
</style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

export default function LegalScreen() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const [page, setPage] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const resolvedSlug = SLUG_ALIASES[String(slug || 'terms-of-service')] || 'terms-of-service';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    homepageService
      .getLegalPage(resolvedSlug)
      .then((data: Record<string, unknown>) => {
        if (!cancelled) setPage(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [resolvedSlug]);

  const rawHtml = (page?.bodyHtml || page?.body_html || page?.content || page?.body || '') as string;
  const html = useMemo(() => (rawHtml ? prepareLegalHtml(rawHtml) : ''), [rawHtml]);
  const title = String(page?.title || 'Legal');

  if (loading) {
    return (
      <Screen title="Legal" showBack scroll={false}>
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      </Screen>
    );
  }

  if (error || !html) {
    return (
      <Screen title={title} showBack>
        <Text style={styles.empty}>
          This content is not available right now. Please check back later or contact support.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen title={title} showBack scroll={false}>
      <View style={styles.webWrap}>
        <WebView
          originWhitelist={['*']}
          source={{ html: buildHtmlDocument(html) }}
          style={styles.web}
          showsVerticalScrollIndicator
          startInLoadingState
          renderLoading={() => <ActivityIndicator color={colors.primary} style={styles.loader} />}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: 32 },
  empty: { fontSize: 14, color: colors.mutedForeground, lineHeight: 22, marginTop: 16 },
  webWrap: { flex: 1, marginHorizontal: -16 },
  web: { flex: 1, backgroundColor: colors.background },
});
