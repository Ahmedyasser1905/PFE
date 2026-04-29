/**
 * Shared formatting utilities.
 *
 * Centralizes all formatting logic that was previously duplicated
 * inline across multiple screens (currency, labels, dates).
 */

import { APP_CONFIG } from '~/constants/config';

// ─── Currency ─────────────────────────────────────────────────────────────────

/**
 * Formats a number as an Algerian Dinar amount.
 * @example formatCurrency(1_500_000) → "1 500 000 DA"
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || isNaN(Number(amount))) return `0 ${APP_CONFIG.CURRENCY}`;
  return `${Number(amount).toLocaleString()} ${APP_CONFIG.CURRENCY}`;
}

// ─── Labels ───────────────────────────────────────────────────────────────────

/**
 * Converts a snake_case or camelCase key into a human-readable title.
 * @example formatLabel('grand_travaux') → "Grand Travaux"
 */
export function formatLabel(key: string): string {
  if (!key) return '';
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
}

// ─── Dates ────────────────────────────────────────────────────────────────────

/**
 * Returns a short, human-readable relative date string.
 * @example formatRelativeDate('2024-01-15T12:00:00Z') → "Jan 15, 2024"
 */
export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * Returns a short project ID prefix (first segment of UUID) in uppercase.
 * @example formatProjectId('abc1-def2-...') → "ABC1"
 */
export function formatProjectId(projectId: string | null | undefined): string {
  if (!projectId) return '';
  return (projectId.split('-')[0] ?? '').toUpperCase();
}
