/**
 * Password Protection Resolution Utilities
 *
 * Framework-agnostic utilities for handling password-protected content.
 * These utilities determine if content is password-protected and filter
 * out protected content from lists (e.g., collection entry listings).
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
export function isPasswordProtected(password_protected?: boolean): boolean {
  return password_protected === true;
}
