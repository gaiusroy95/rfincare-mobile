import { resolveMediaUrl } from '@/src/utils/mediaUrls';

export function getStoryPhotoUrl(photoUrl?: string | null): string | null {
  return resolveMediaUrl(photoUrl);
}
