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
 *
 * The BASE_URL is sourced from the shared network utility, so images
 * always use the SAME host that the API requests use — including any
 * dynamically-detected dev IP.
 */
import { getCachedBaseUrl } from '~/utils/network';

/**
 * High-quality construction fallback image.
 * Used when no image is provided or image fails to load.
 */
export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=600&auto=format&fit=crop';

/**
 * Resolves a potentially relative image URL to an absolute URL.
 *
 * @param url - The raw image URL from the project data (may be relative, absolute, or null)
 * @returns A fully resolved image URL, or the FALLBACK_IMAGE if url is invalid
 */
export function resolveImageUrl(url?: string | null): string {
  // The BASE_URL for the backend server (without /api suffix).
  // We strip /api if present since image paths are relative to the server root.
  // Pulled from the shared network utility so images and API calls always
  // target the same host (works across networks once detection runs).
  const BASE_URL = getCachedBaseUrl().replace(/\/api\/?$/, '');

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
