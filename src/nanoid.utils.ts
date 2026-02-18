import { customAlphabet } from "nanoid";

// CRITICAL: This MUST match the backend configuration exactly!
// Backend: NANOID_ALPHABET environment variable
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const LENGTH = 10;

// Initialize the NanoID generator with our custom alphabet
const nanoid = customAlphabet(ALPHABET, LENGTH);

/**
 * Generate a new unique ID using NanoID
 * @returns A 10-character ID string
 * @example
 * const id = generateId() // "xr7k9mjPtn"
 */
export function generateId(): string {
  return nanoid();
}

/**
 * Validate that a string is a valid NanoID according to our configuration
 * @param id - The ID string to validate
 * @returns true if valid, false otherwise
 * @example
 * isValidId("xr7k9mjPtn") // true
 * isValidId("invalid") // false
 */
export function isValidId(id: string): boolean {
  // Check length
  if (id.length !== LENGTH) {
    return false;
  }

  // Check all characters are in our alphabet
  return id.split("").every(char => ALPHABET.includes(char));
}

/**
 * Get the current NanoID configuration
 * Useful for debugging and validation
 */
export function getConfig() {
  return {
    alphabet: ALPHABET,
    alphabetSize: ALPHABET.length,
    length: LENGTH,
    entropy: Math.pow(ALPHABET.length, LENGTH),
  };
}
