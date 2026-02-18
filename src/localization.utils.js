/**
 * Get localized string with proper fallback logic
 * 1. Try user's preferred locale (from cookie or browser)
 * 2. Try default locale (from deployment config)
 * 3. Try 'en' as ultimate fallback
 * 4. Return first available value as last resort
 */
export function getLocalizedString(value, options) {
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
  // Return first available value as last resort
  const keys = Object.keys(value);
  if (keys.length > 0 && value[keys[0]]) {
    return value[keys[0]];
  }
  return "";
}
/**
 * Get all available locales from a localized string
 */
export function getAvailableLocales(value) {
  if (typeof value === "string") return [];
  return Object.keys(value).filter(key => value[key]);
}
/**
 * Check if a value is a localized string object
 */
export function isLocalizedString(value) {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length > 0
  );
}
/**
 * Detect locale from various sources (URL, browser, config)
 * Priority: URL param > path segment > browser language > default
 * Note: This function requires browser environment
 */
export function detectLocale(defaultLocale = "en", supportedLocales = ["en"]) {
  // Check if we're in a browser environment
  const glob = globalThis;
  if (typeof glob.window === "undefined") {
    return defaultLocale;
  }
  // Check URL parameter (?lang=de)
  const urlParams = new URLSearchParams(glob.window.location.search);
  const urlLang = urlParams.get("lang");
  if (urlLang && supportedLocales.includes(urlLang)) {
    return urlLang;
  }
  // Check path-based locale (/de/page)
  const pathSegments = glob.window.location.pathname.split("/").filter(Boolean);
  if (pathSegments[0] && supportedLocales.includes(pathSegments[0])) {
    return pathSegments[0];
  }
  // Check browser language
  if (typeof glob.navigator !== "undefined") {
    const browserLang = glob.navigator.language.split("-")[0];
    if (supportedLocales.includes(browserLang)) {
      return browserLang;
    }
  }
  return defaultLocale;
}
/**
 * Format locale for HTML lang attribute (e.g., 'en-US')
 */
export function formatLocaleForHtml(locale) {
  const localeMap = {
    en: "en-US",
    de: "de-DE",
    fr: "fr-FR",
    es: "es-ES",
    it: "it-IT",
    pt: "pt-PT",
    nl: "nl-NL",
    pl: "pl-PL",
  };
  return localeMap[locale] || locale;
}
