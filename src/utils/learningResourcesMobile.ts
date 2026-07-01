import * as FileSystem from 'expo-file-system/legacy';
import { getAccessToken, loadStoredTokens } from '@/src/api/apiClient';
import { getApiBaseUrl, MOBILE_CLIENT_HEADER } from '@/src/api/runtimeConfig';
import { resolveLearningOpenUrl } from '@/src/utils/learningResources';

export type LearningResource = {
  id: string;
  type: string;
  title: string;
  description?: string;
  duration: string;
  progress: number;
  isNew: boolean;
  openUrl: string | null;
  legacy?: boolean;
  contentType?: string;
};

export function mapLearningResource(item: Record<string, unknown>): LearningResource {
  const id = String(item.id ?? '');
  const contentType = String(item.contentType || item.content_type || item.resourceType || '');
  const openUrl =
    resolveLearningOpenUrl(item) ||
    (id && !String(id).startsWith('circular-')
      ? `/portal/agent/learning/content/${encodeURIComponent(id)}/file`
      : id
        ? `/portal/agent/learning/circulars/${encodeURIComponent(String(id).replace(/^circular-/, ''))}/file`
        : null);

  return {
    id,
    type: String(item.type || contentType || 'document'),
    title: String(item.title || 'Untitled'),
    description: item.description ? String(item.description) : undefined,
    duration: String(item.duration || item.durationLabel || item.duration_label || '—'),
    progress: Number(item.progress ?? 0),
    isNew: Boolean(item.isNew ?? item.is_new),
    openUrl,
    legacy: Boolean(item.legacy),
    contentType,
  };
}

function toApiPath(url: string): string {
  const base = getApiBaseUrl().replace(/\/$/, '');
  if (url.startsWith('http')) {
    if (base && url.startsWith(base)) return url.slice(base.length) || '/';
    return url;
  }
  return url.startsWith('/') ? url : `/${url}`;
}

function isProtectedPortalFile(pathOrUrl: string): boolean {
  try {
    const path = pathOrUrl.startsWith('http') ? new URL(pathOrUrl).pathname : pathOrUrl;
    return path.includes('/portal/agent/learning/') && path.endsWith('/file');
  } catch {
    return false;
  }
}

function extensionFor(resource: LearningResource, mimeType?: string): string {
  if (mimeType?.includes('pdf')) return '.pdf';
  if (mimeType?.includes('mp4')) return '.mp4';
  if (mimeType?.includes('webm')) return '.webm';
  if (mimeType?.includes('quicktime')) return '.mov';
  if (resource.type === 'video' || resource.contentType === 'video') return '.mp4';
  return '.pdf';
}

async function downloadWithAuth(fullUrl: string, dest: string): Promise<string> {
  await loadStoredTokens();
  const token = getAccessToken();
  const headers: Record<string, string> = { 'X-Rfincare-Client': MOBILE_CLIENT_HEADER };
  if (token) headers.Authorization = `Bearer ${token}`;

  const result = await FileSystem.downloadAsync(fullUrl, dest, { headers });
  if (result.status !== 200) {
    throw new Error('Could not download training file. Please sign in again and retry.');
  }
  return result.uri;
}

export type LoadedLearningMedia = {
  localUri: string;
  mimeType: string;
  isVideo: boolean;
  isExternal: boolean;
};

export async function loadLearningResourceMedia(resource: LearningResource): Promise<LoadedLearningMedia> {
  const openUrl = resource.openUrl;
  if (!openUrl) throw new Error('This resource has no file attached.');

  const base = getApiBaseUrl().replace(/\/$/, '');
  const isVideo = resource.type === 'video' || resource.contentType === 'video';

  if (openUrl.startsWith('http') && !openUrl.startsWith(base)) {
    return {
      localUri: openUrl,
      mimeType: isVideo ? 'video/mp4' : 'application/pdf',
      isVideo,
      isExternal: true,
    };
  }

  const apiPath = toApiPath(openUrl);
  const fullUrl = openUrl.startsWith('http') ? openUrl : `${base}${apiPath}`;
  const ext = extensionFor(resource);
  const dest = `${FileSystem.cacheDirectory}learning-${resource.id}${ext}`;

  const needsAuth = isProtectedPortalFile(apiPath);
  let localUri: string;
  if (needsAuth) {
    localUri = await downloadWithAuth(fullUrl, dest);
  } else {
    const result = await FileSystem.downloadAsync(fullUrl, dest);
    if (result.status !== 200) throw new Error('Could not download file');
    localUri = result.uri;
  }

  const mimeType = isVideo ? 'video/mp4' : 'application/pdf';

  return {
    localUri,
    mimeType,
    isVideo,
    isExternal: false,
  };
}

export async function readLearningFileBase64(localUri: string): Promise<string> {
  return FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 });
}
