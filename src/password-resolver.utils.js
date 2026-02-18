/**
 * Password Protection Resolution Utilities
 *
 * Framework-agnostic utilities for handling password-protected content.
 * These utilities determine if content is password-protected and filter
 * out protected content from lists (e.g., blog post listings).
 *
 * According to the architecture:
 * - Backend returns ALL content with metadata
 * - Engine/frontend decides visibility at render time
 * - Password protection is checked on the client side
 */
/**
 * Check if content is password-protected
 * @param password_protected - Whether the content requires a password
 * @returns True if content is password-protected, false otherwise
 */
export function isPasswordProtected(password_protected) {
  return password_protected === true;
}
/**
 * Filter password-protected content from a list
 * Useful for listings like blog posts where we don't want to show protected items
 * @param items - Array of items with password_protected metadata
 * @returns Filtered array with only non-protected items
 */
export function filterPasswordProtectedContent(items) {
  return items.filter(item => !isPasswordProtected(item.password_protected));
}
