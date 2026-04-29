/**
 * Image URL Resolver — Centralized image URL normalization.
 *
 * Handles ALL possible image field names from the backend:
 *   image_url | imageUrl | image | imagePath → resolved URL
 *
 * Rules:
 *   1. If URL is falsy → return FALLBACK_IMAGE
 *   2. If URL starts with "http" → return as-is (already absolute)
 *   3. Otherwise → prepend BASE_URL (relative path from backend)
 */
import { API_URLS } from '~/constants/config';

/**
 * High-quality construction fallback image.
 * Used when no image is provided or image fails to load.
 */
export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1503387762-592dee58c190?auto=format&fit=crop&w=600&q=80';

/**
 * Resolves a potentially relative image URL to an absolute URL.
 *
 * @param url - The raw image URL from the project data (may be relative, absolute, or null)
 * @returns A fully resolved image URL, or the FALLBACK_IMAGE if url is invalid
 */
export function resolveImageUrl(url?: string | null): string {
  // The BASE_URL for the backend server (without /api suffix)
  // We strip /api if present since image paths are relative to the server root
  const devUrl = API_URLS.DEVELOPMENT.replace(/\/api\/?$/, '');
  const BASE_URL = __DEV__ ? devUrl : API_URLS.PRODUCTION.replace(/\/api\/?$/, '');

  // 1. No URL provided → fallback
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return FALLBACK_IMAGE;
  }

  const trimmed = url.trim();

  // 2. Already absolute URL → return as-is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // 3. Relative path → prepend BASE_URL
  return trimmed.startsWith('/')
    ? `${BASE_URL}${trimmed}`
    : `${BASE_URL}/${trimmed}`;
}

/**
 * Extracts the image URL from any shape of project data.
 * Normalizes all possible field names to a single value.
 *
 * @param data - Raw or mapped project data (may contain imageUrl, image_url, image, imagePath)
 * @returns The best available image URL string, or null if none found
 */
export function extractImageUrl(data: Record<string, any> | null | undefined): string | null {
  if (!data) return null;
  return data.imageUrl || data.image_url || data.image || data.imagePath || null;
}
