import type { VocabularyTerm } from "@otl-core/cms-types";

/**
 * Resolve a vocabulary term to a plain string.
 * Fallback chain: exact locale -> defaultLocale -> first available key -> "".
 */
export function resolveVocabularyTerm(
  term: VocabularyTerm,
  locale: string,
  defaultLocale?: string,
): string {
  if (typeof term === "string") return term;
  if (term[locale]) return term[locale];
  if (defaultLocale && defaultLocale !== locale && term[defaultLocale]) {
    return term[defaultLocale];
  }
  return term[Object.keys(term)[0]] ?? "";
}

/**
 * Return a URL-safe slug of the resolved vocabulary term.
 */
export function vocabularySlug(
  term: VocabularyTerm,
  locale: string,
  defaultLocale?: string,
): string {
  return resolveVocabularyTerm(term, locale, defaultLocale)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Return the set of locales that are missing a translation for this term.
 * Only relevant for localized (object) terms; returns empty array for plain strings.
 */
export function missingVocabularyLocales(
  term: VocabularyTerm,
  requiredLocales: string[],
): string[] {
  if (typeof term === "string") return [];
  return requiredLocales.filter((loc) => !term[loc] || term[loc].trim() === "");
}
