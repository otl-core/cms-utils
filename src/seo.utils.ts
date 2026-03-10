/**
 * SEO utility functions for OTL CMS.
 */

/**
 * Convert a short locale code to the `og:locale` format.
 *
 * "en" -> "en_US", "de" -> "de_DE", etc.
 * If the code is already in `xx_XX` form it is returned as-is.
 */
export function localeToOgFormat(locale: string): string {
  if (locale.includes("_")) return locale;
  const map: Record<string, string> = {
    en: "en_US",
    de: "de_DE",
    fr: "fr_FR",
    es: "es_ES",
    it: "it_IT",
    pt: "pt_BR",
    nl: "nl_NL",
    ja: "ja_JP",
    zh: "zh_CN",
    ko: "ko_KR",
    ru: "ru_RU",
    ar: "ar_SA",
    pl: "pl_PL",
    sv: "sv_SE",
    da: "da_DK",
    fi: "fi_FI",
    nb: "nb_NO",
    tr: "tr_TR",
  };
  return map[locale.toLowerCase()] || `${locale}_${locale.toUpperCase()}`;
}

/**
 * Build hreflang alternate URLs for multi-locale support.
 *
 * Uses the locale-prefix pattern: the default locale maps to the bare path
 * while other locales are prefixed (`/de/path`).  An `x-default` entry
 * points to the un-prefixed URL.
 *
 * Returns `undefined` when there is only a single locale (hreflang would be
 * pointless).
 */
export function buildHreflangAlternates(
  siteUrl: string,
  path: string,
  supportedLocales: string[],
  defaultLocale: string,
): Record<string, string> | undefined {
  if (!siteUrl || supportedLocales.length <= 1) return undefined;

  const languages: Record<string, string> = {};
  for (const loc of supportedLocales) {
    if (loc === defaultLocale) {
      languages[loc] = `${siteUrl}${path}`;
    } else {
      languages[loc] = `${siteUrl}/${loc}${path}`;
    }
  }
  languages["x-default"] = `${siteUrl}${path}`;
  return languages;
}

export interface PaginationInfo {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Walk through enriched layout sections/blocks and return the first
 * pagination object found (from an `entry-list` or `collection-pagination`
 * block's `data.pagination`).
 */
export function extractPaginationFromLayout(
  layout: unknown[] | undefined,
): PaginationInfo | null {
  if (!layout) return null;
  for (const section of layout) {
    const sConfig = (section as Record<string, unknown>)?.config as
      | Record<string, unknown>
      | undefined;
    if (!sConfig) continue;
    const result = findPaginationInBlocks(
      (sConfig.children as unknown[]) || [],
    );
    if (result) return result;
  }
  return null;
}

function findPaginationInBlocks(blocks: unknown[]): PaginationInfo | null {
  for (const block of blocks) {
    const b = block as Record<string, unknown>;
    const config = b?.config as Record<string, unknown> | undefined;
    if (!config) continue;
    const data = config.data as Record<string, unknown> | undefined;
    if (data?.pagination) {
      const p = data.pagination as Record<string, unknown>;
      return {
        page: (p.page as number) || 1,
        totalPages: (p.totalPages as number) || 1,
        hasNext: (p.hasNext as boolean) || false,
        hasPrev: (p.hasPrev as boolean) || false,
      };
    }
    if (config.children) {
      const nested = findPaginationInBlocks(config.children as unknown[]);
      if (nested) return nested;
    }
    if (config.child) {
      const nested = findPaginationInBlocks(config.child as unknown[]);
      if (nested) return nested;
    }
  }
  return null;
}
