import type { LocalizedString } from "@otl-core/cms-types";

/**
 * Get localized string with proper fallback logic
 * 1. Try user's preferred locale (from cookie or browser)
 * 2. Try default locale (from site config)
 * 3. Try 'en' as ultimate fallback
 * 4. Return first available value as last resort
 */
export function getLocalizedString(
  value: string | LocalizedString | null | undefined,
  options?: {
    preferredLocale?: string | null;
    defaultLocale?: string;
    supportedLocales?: string[];
  },
): string {
  // Handle null/undefined
  if (value === null || value === undefined) return "";

  // If it's already a string, return it
  if (typeof value === "string") return value;

  // Get the preferred locale
  const preferredLocale =
    options?.preferredLocale || options?.defaultLocale || "en";

  // Try preferred locale
  if (preferredLocale in value && value[preferredLocale]) {
    return value[preferredLocale];
  }

  // Try default locale
  if (
    options?.defaultLocale &&
    options.defaultLocale in value &&
    value[options.defaultLocale]
  ) {
    return value[options.defaultLocale];
  }

  // Try 'en' as fallback
  if ("en" in value && value.en) {
    return value.en;
  }

  // Try any supported locale
  if (options?.supportedLocales) {
    for (const locale of options.supportedLocales) {
      if (locale in value && value[locale]) {
        return value[locale];
      }
    }
  }

  // Return first available non-empty value as last resort
  for (const key of Object.keys(value)) {
    if (value[key]) {
      return value[key];
    }
  }

  return "";
}
