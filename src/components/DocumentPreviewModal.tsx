import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/src/components/Button';
import StatusBadge from '@/src/components/StatusBadge';
import { colors } from '@/src/theme';
import {
  loadDocumentForPreview,
  readDocumentBase64,
  type DocumentPreviewSource,
  type LoadedDocumentPreview,
} from '@/src/utils/documentPreviewMobile';
// @ts-expect-error JS module
import { documentTypeLabel } from '@/src/utils/documentUrls';

type Props = {
  visible: boolean;
  document: Record<string, unknown> | null;
  onClose: () => void;
};

const webViewProps = {
  allowFileAccess: true,
  allowFileAccessFromFileURLs: true,
  allowUniversalAccessFromFileURLs: true,
  originWhitelist: ['*'] as string[],
  javaScriptEnabled: true,
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

export default function DocumentPreviewModal({ visible, document, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<LoadedDocumentPreview | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);

  const docType = String(document?.documentType || document?.document_type || document?.type || '');
  const title = documentTypeLabel(docType) || String(document?.documentName || document?.document_name || 'Document');
  const fileName = String(document?.documentName || document?.document_name || '');
  const status = String(document?.status || document?.verificationStatus || 'pending');

  useEffect(() => {
    if (!visible || !document?.id) {
      setPreview(null);
      setPdfBase64(null);
      setError('');
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    setPreview(null);
    setPdfBase64(null);

    (async () => {
      try {
        const loaded = await loadDocumentForPreview(document as DocumentPreviewSource);
        if (cancelled) return;
        setPreview(loaded);
        if (loaded.mediaType === 'pdf') {
          const data = await readDocumentBase64(loaded.localUri);
          if (!cancelled) setPdfBase64(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message || 'Could not load document preview.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, document?.id]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={2}>{title}</Text>
            {fileName && fileName !== title ? (
              <Text style={styles.subtitle} numberOfLines={1}>{fileName}</Text>
            ) : null}
            <StatusBadge status={status} />
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={26} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.customer} />
              <Text style={styles.hint}>Loading document…</Text>
            </View>
          ) : null}

          {!loading && error ? (
            <View style={styles.center}>
              <Ionicons name="alert-circle-outline" size={40} color={colors.destructive} />
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}

          {!loading && !error && preview?.mediaType === 'image' ? (
            <Image source={{ uri: preview.localUri }} style={styles.image} resizeMode="contain" />
          ) : null}

          {!loading && !error && preview?.mediaType === 'pdf' && pdfBase64 ? (
            <WebView
              source={{ html: pdfHtml(pdfBase64) }}
              style={styles.webview}
              {...webViewProps}
              startInLoadingState
            />
          ) : null}

          {!loading && !error && preview?.mediaType === 'doc' ? (
            <View style={styles.center}>
              <Ionicons name="document-text-outline" size={48} color={colors.mutedForeground} />
              <Text style={styles.hint}>Preview is not available for this file type.</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Button title="Close" variant="customer" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  headerText: { flex: 1, gap: 6 },
  title: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  subtitle: { fontSize: 13, color: colors.mutedForeground },
  body: { flex: 1, backgroundColor: colors.muted },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  hint: { fontSize: 14, color: colors.mutedForeground, textAlign: 'center', lineHeight: 20 },
  error: { fontSize: 14, color: colors.destructive, textAlign: 'center', lineHeight: 20 },
  image: { flex: 1, width: '100%', backgroundColor: '#fff' },
  webview: { flex: 1, backgroundColor: '#fff' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
});
