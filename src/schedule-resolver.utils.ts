/**
 * Schedule Resolver
 * Framework-agnostic content scheduling utilities
 */

/**
 * Check if content is currently visible based on schedule metadata.
 * Returns true if the content should be shown to visitors.
 *
 * @param publishAt - ISO 8601 timestamp when content should become visible
 * @param expiresAt - ISO 8601 timestamp when content should stop being visible
 * @param now - Optional current time (defaults to new Date())
 * @returns true if content is visible, false otherwise
 */
export function isContentVisible(
  publishAt: string | null | undefined,
  expiresAt: string | null | undefined,
  now?: Date
): boolean {
  const currentTime = now || new Date();

  if (publishAt) {
    const publishDate = new Date(publishAt);
    if (currentTime < publishDate) return false; // Not yet published
  }

  if (expiresAt) {
    const expiryDate = new Date(expiresAt);
    if (currentTime >= expiryDate) return false; // Expired
  }

  return true;
}

/**
 * Filter a list of items based on schedule metadata.
 * Each item must have optional publish_at and expires_at fields.
 *
 * @param items - Array of items with schedule metadata
 * @param now - Optional current time (defaults to new Date())
 * @returns Filtered array containing only currently visible items
 */
export function filterScheduledContent<
  T extends { publish_at?: string; expires_at?: string },
>(items: T[], now?: Date): T[] {
  return items.filter(item =>
    isContentVisible(item.publish_at, item.expires_at, now)
  );
}
