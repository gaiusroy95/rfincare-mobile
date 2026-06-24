import { getApiBaseUrl } from '@/src/api/runtimeConfig';

export function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const base = getApiBaseUrl().replace(/\/$/, '');
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return base ? `${base}${path}` : path;
}

export function youtubeThumbnail(url?: string | null): string | null {
  const match = url?.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}
