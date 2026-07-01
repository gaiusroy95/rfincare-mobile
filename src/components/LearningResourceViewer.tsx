import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme';
import LearningVideoPlayer from '@/src/components/LearningVideoPlayer';
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
  const [videoModalOpen, setVideoModalOpen] = useState(false);

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

  useEffect(() => {
    if (media?.isVideo && !loading && !error) {
      setVideoModalOpen(true);
    } else {
      setVideoModalOpen(false);
    }
  }, [media?.localUri, media?.isVideo, loading, error]);

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
    return (
      <>
        <TouchableOpacity
          style={styles.videoPreview}
          activeOpacity={0.9}
          onPress={() => setVideoModalOpen(true)}
          accessibilityLabel={`Open ${resource.title} in wide view`}
        >
          <View style={styles.videoPreviewInner}>
            <Ionicons name="videocam" size={40} color="#fff" />
            <Text style={styles.videoPreviewTitle} numberOfLines={2}>{resource.title}</Text>
            <Text style={styles.videoPreviewAction}>Tap to open wide view with audio controls</Text>
          </View>
          <View style={styles.expandBadge}>
            <Ionicons name="expand" size={18} color="#fff" />
          </View>
        </TouchableOpacity>

        <LearningVideoPlayer
          title={resource.title}
          media={media}
          visible={videoModalOpen}
          onClose={() => setVideoModalOpen(false)}
        />
      </>
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
  videoPreview: {
    height: 220,
    backgroundColor: '#111827',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  videoPreviewInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  videoPreviewTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  videoPreviewAction: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    textAlign: 'center',
  },
  expandBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(236,72,153,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
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
