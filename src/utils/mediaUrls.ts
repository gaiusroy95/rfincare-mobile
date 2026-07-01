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

export function youtubeId(url?: string | null): string | null {
  if (!url) return null;
  const value = String(url).trim();
  if (!value) return null;

  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|shorts\/|live\/|v\/))([\w-]{11})/i,
    /[?&]v=([\w-]{11})/i,
    /vid:([\w-]{11})/i,
    /\/vi\/([\w-]{11})(?:\/|$)/i,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export function resolveVideoYoutubeUrl(video?: {
  youtubeUrl?: string | null;
  youtubeurl?: string | null;
  youtube_url?: string | null;
} | null): string | null {
  if (!video) return null;
  return video.youtubeUrl || video.youtubeurl || video.youtube_url || null;
}

export function youtubeThumbnail(url?: string | null): string | null {
  const id = youtubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

/** In-app embed URL that plays inline without redirecting to the YouTube app/site. */
export function youtubeEmbedUrl(url?: string | null): string | null {
  const id = youtubeId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
}
