import * as FileSystem from 'expo-file-system/legacy';
import { getAccessToken, loadStoredTokens } from '@/src/api/apiClient';
import { getApiBaseUrl, MOBILE_CLIENT_HEADER } from '@/src/api/runtimeConfig';
// @ts-expect-error JS module
import { inferDocumentMediaType, getDocumentPreviewUrl } from '@/src/utils/documentUrls';

export type DocumentPreviewSource = {
  id?: string;
  mimeType?: string;
  mime_type?: string;
  documentType?: string;
  document_type?: string;
  documentName?: string;
  document_name?: string;
  filePath?: string;
  file_path?: string;
  previewUrl?: string;
  preview_url?: string;
};

export type LoadedDocumentPreview = {
  localUri: string;
  mediaType: 'image' | 'pdf' | 'doc';
  mimeType: string;
};

function extensionFor(doc: DocumentPreviewSource, mimeType?: string): string {
  const mt = String(mimeType || doc.mimeType || doc.mime_type || '').toLowerCase();
  const name = String(doc.documentName || doc.document_name || doc.filePath || doc.file_path || '').toLowerCase();
  if (mt.includes('pdf') || name.endsWith('.pdf')) return '.pdf';
  if (mt.includes('png') || name.endsWith('.png')) return '.png';
  if (mt.includes('webp') || name.endsWith('.webp')) return '.webp';
  if (mt.includes('gif') || name.endsWith('.gif')) return '.gif';
  if (mt.startsWith('image/') || /\.(jpe?g)$/i.test(name)) return '.jpg';
  return '';
}

async function downloadAuthenticated(url: string, dest: string): Promise<string> {
  await loadStoredTokens();
  const token = getAccessToken();
  const headers: Record<string, string> = { 'X-Rfincare-Client': MOBILE_CLIENT_HEADER };
  if (token) headers.Authorization = `Bearer ${token}`;

  const result = await FileSystem.downloadAsync(url, dest, { headers });
  if (result.status !== 200) {
    throw new Error('Could not load document. Please sign in and try again.');
  }
  return result.uri;
}

export async function loadDocumentForPreview(doc: DocumentPreviewSource): Promise<LoadedDocumentPreview> {
  if (!doc?.id) {
    throw new Error('Document preview is not available.');
  }

  const base = getApiBaseUrl().replace(/\/$/, '');
  const ext = extensionFor(doc);
  const dest = `${FileSystem.cacheDirectory}doc-preview-${doc.id}${ext || '.bin'}`;
  const mimeType = String(doc.mimeType || doc.mime_type || 'application/octet-stream');
  const mediaType = inferDocumentMediaType(doc) as 'image' | 'pdf' | 'doc';

  try {
    const localUri = await downloadAuthenticated(
      `${base}/documents/${doc.id}/download?inline=1`,
      dest,
    );
    return { localUri, mediaType, mimeType };
  } catch (authErr) {
    const staticUrl = getDocumentPreviewUrl(doc);
    if (staticUrl) {
      const localUri = await downloadAuthenticated(staticUrl, dest);
      return { localUri, mediaType, mimeType };
    }
    throw authErr;
  }
}

export async function readDocumentBase64(localUri: string): Promise<string> {
  return FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 });
}
