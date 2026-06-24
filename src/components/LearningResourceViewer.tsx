import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '@/src/theme';
import {
  readLearningFileBase64,
  type LearningResource,
  type LoadedLearningMedia,
} from '@/src/utils/learningResourcesMobile';

type Props = {
  resource: LearningResource;
  media: LoadedLearningMedia | null;
  loading?: boolean;
  error?: string | null;
};

const webViewFileProps = {
  allowFileAccess: true,
  allowFileAccessFromFileURLs: true,
  allowUniversalAccessFromFileURLs: true,
  originWhitelist: ['*'] as string[],
  javaScriptEnabled: true,
  allowsFullscreenVideo: true,
  mediaPlaybackRequiresUserAction: false,
  mixedContentMode: 'always' as const,
};

function videoHtml(uri: string): string {
  const safe = uri.replace(/"/g, '&quot;');
  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { background: #000; height: 100%; width: 100%; }
  body { display: flex; align-items: center; justify-content: center; }
  video { width: 100%; max-height: 100vh; background: #000; }
</style>
</head><body>
  <video controls playsinline webkit-playsinline preload="metadata" src="${safe}"></video>
</body></html>`;
}

function pdfHtml(base64: string): string {
  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=3" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; width: 100%; background: #f4f4f5; }
  embed { width: 100%; height: 100%; border: 0; }
</style>
</head><body>
  <embed src="data:application/pdf;base64,${base64}" type="application/pdf" />
</body></html>`;
}

export default function LearningResourceViewer({ resource, media, loading, error }: Props) {
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setPdfBase64(null);

    if (!media || media.isVideo || media.isExternal) return undefined;

    setPdfLoading(true);
    readLearningFileBase64(media.localUri)
      .then((data) => {
        if (!cancelled) setPdfBase64(data);
      })
      .catch(() => {
        if (!cancelled) setPdfBase64(null);
      })
      .finally(() => {
        if (!cancelled) setPdfLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [media?.localUri, media?.isVideo, media?.isExternal]);

  if (loading) {
    return (
      <View style={styles.box}>
        <ActivityIndicator color={colors.agent} size="large" />
        <Text style={styles.hint}>Loading {resource.title}…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.box}>
        <Text style={styles.errorTitle}>Could not load content</Text>
        <Text style={styles.hint}>{error}</Text>
      </View>
    );
  }

  if (!media) {
    return (
      <View style={styles.box}>
        <Text style={styles.placeholderTitle}>Training & Certification</Text>
        <Text style={styles.hint}>Tap Start or Review on a module below to watch or read it here.</Text>
      </View>
    );
  }

  if (media.isVideo) {
    if (media.isExternal) {
      return (
        <View style={styles.player}>
          <WebView source={{ uri: media.localUri }} style={styles.webview} {...webViewFileProps} />
        </View>
      );
    }

    const uri = media.localUri;
    const useDirectUri = Platform.OS === 'android' && uri.startsWith('file://');

    return (
      <View style={styles.player}>
        <WebView
          source={useDirectUri ? { uri } : { html: videoHtml(uri), baseUrl: Platform.OS === 'ios' ? uri : undefined }}
          style={styles.webview}
          allowingReadAccessToURL={Platform.OS === 'ios' ? uri : undefined}
          {...webViewFileProps}
        />
      </View>
    );
  }

  if (pdfLoading) {
    return (
      <View style={styles.player}>
        <ActivityIndicator color={colors.agent} style={styles.pdfLoader} />
      </View>
    );
  }

  if (pdfBase64) {
    return (
      <View style={styles.pdfPlayer}>
        <WebView source={{ html: pdfHtml(pdfBase64) }} style={styles.webview} {...webViewFileProps} />
      </View>
    );
  }

  return (
    <View style={styles.player}>
      <WebView source={{ uri: media.localUri }} style={styles.webview} {...webViewFileProps} startInLoadingState />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  player: {
    height: 220,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pdfPlayer: {
    height: 360,
    backgroundColor: '#f4f4f5',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  webview: { flex: 1, backgroundColor: 'transparent' },
  pdfLoader: { flex: 1, alignSelf: 'center' },
  placeholderTitle: { fontWeight: '700', fontSize: 16, color: colors.foreground, marginBottom: 8 },
  errorTitle: { fontWeight: '700', color: colors.destructive, marginBottom: 8 },
  hint: { fontSize: 13, color: colors.mutedForeground, textAlign: 'center', lineHeight: 18 },
});
