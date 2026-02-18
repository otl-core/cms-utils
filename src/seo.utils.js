/**
 * SEO utility functions for OTL CMS.
 *
 * These helpers extract common metadata from deployment configs and are used
 * by both the engine's `generateMetadata` and component-level code.
 *
 * They are environment-agnostic: callers pass an explicit `siteUrlOverride`
 * (e.g. from `process.env.NEXT_PUBLIC_SITE_URL`) instead of reading env vars
 * directly, keeping the package framework-independent.
 */

/**
 * Derive the public site origin (no trailing slash).
 *
 * Priority:
 *  1. `siteUrlOverride` (e.g. env var)
 *  2. First custom domain from deployment config
 *  3. Subdomain-based OTL Studio URL
 */
export function deriveSiteUrl(configs, siteUrlOverride) {
  let url = "";
  if (siteUrlOverride) {
    url = siteUrlOverride;
  } else {
    const deployment = configs.deployment;
    const customDomains = deployment?.custom_domains;
    if (customDomains?.[0]) {
      url = `https://${customDomains[0]}`;
    } else {
      const subdomain = deployment?.subdomain;
      if (subdomain) url = `https://${subdomain}.otl.studio`;
    }
  }
  return url.replace(/\/+$/, "");
}
/** Extract the localized site name from configs. */
export function deriveSiteName(configs, locale) {
  const website = configs.website;
  if (!website?.site_name) return "Website";
  if (typeof website.site_name === "string") return website.site_name;
  const names = website.site_name;
  return names[locale] || names.en || "Website";
}
/** Extract the localized site description from configs. */
export function deriveSiteDescription(configs, locale) {
  const website = configs.website;
  if (!website?.description) return undefined;
  if (typeof website.description === "string") return website.description;
  const descs = website.description;
  return descs[locale] || undefined;
}

/**
 * Detect a locale prefix from the first URL segment.
 *
 * Returns `[locale, pathWithoutPrefix]`.  If the first segment is not a
 * recognised locale, the deployment's default locale and the original path
 * are returned unchanged.
 */
export function detectLocaleFromSegments(
  segments,
  fullPath,
  supportedLocales,
  defaultLocale
) {
  const normalizedLocales = supportedLocales.map(l => l.toLowerCase());
  const firstSegment = segments[0];
  const localeIndex = normalizedLocales.indexOf(firstSegment?.toLowerCase());
  if (localeIndex !== -1) {
    return [
      supportedLocales[localeIndex],
      "/" + segments.slice(1).join("/") || "/",
    ];
  }
  return [defaultLocale, fullPath];
}
/**
 * Convert a short locale code to the `og:locale` format.
 *
 * "en" -> "en_US", "de" -> "de_DE", etc.
 * If the code is already in `xx_XX` form it is returned as-is.
 */
export function localeToOgFormat(locale) {
  if (locale.includes("_")) return locale;
  const map = {
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
  siteUrl,
  path,
  supportedLocales,
  defaultLocale
) {
  if (!siteUrl || supportedLocales.length <= 1) return undefined;
  const languages = {};
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
/**
 * Walk through enriched layout sections/blocks and return the first
 * pagination object found (from a `blog-post-list` or `blog-pagination`
 * block's `data.pagination`).
 */
export function extractPaginationFromLayout(layout) {
  if (!layout) return null;
  for (const section of layout) {
    const sConfig = section?.config;
    if (!sConfig) continue;
    const result = findPaginationInBlocks(sConfig.children || []);
    if (result) return result;
  }
  return null;
}
function findPaginationInBlocks(blocks) {
  for (const block of blocks) {
    const b = block;
    const config = b?.config;
    if (!config) continue;
    const data = config.data;
    if (data?.pagination) {
      const p = data.pagination;
      return {
        page: p.page || 1,
        totalPages: p.totalPages || 1,
        hasNext: p.hasNext || false,
        hasPrev: p.hasPrev || false,
      };
    }
    if (config.children) {
      const nested = findPaginationInBlocks(config.children);
      if (nested) return nested;
    }
    if (config.child) {
      const nested = findPaginationInBlocks(config.child);
      if (nested) return nested;
    }
  }
  return null;
}
