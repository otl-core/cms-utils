import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  detectLocale,
  formatLocaleForHtml,
  getAvailableLocales,
  getLocalizedString,
  isLocalizedString,
} from "../src/localization.utils";

describe("Localization Utils", () => {
  describe("getLocalizedString", () => {
    it("should return empty string for null/undefined", () => {
      expect(getLocalizedString(null)).toBe("");
      expect(getLocalizedString(undefined)).toBe("");
    });

    it("should return string directly if already a string", () => {
      expect(getLocalizedString("Hello")).toBe("Hello");
      expect(getLocalizedString("Test")).toBe("Test");
    });

    it("should use preferred locale if available", () => {
      const value = { en: "Hello", de: "Hallo", fr: "Bonjour" };
      expect(getLocalizedString(value, { preferredLocale: "de" })).toBe(
        "Hallo"
      );
      expect(getLocalizedString(value, { preferredLocale: "fr" })).toBe(
        "Bonjour"
      );
    });

    it("should fall back to default locale if preferred not available", () => {
      const value = { en: "Hello", de: "Hallo" };
      expect(
        getLocalizedString(value, {
          preferredLocale: "fr",
          defaultLocale: "de",
        })
      ).toBe("Hallo");
    });

    it("should fall back to en if neither preferred nor default available", () => {
      const value = { en: "Hello", de: "Hallo" };
      expect(
        getLocalizedString(value, {
          preferredLocale: "fr",
          defaultLocale: "es",
        })
      ).toBe("Hello");
    });

    it("should try supported locales if en not available", () => {
      const value = { de: "Hallo", fr: "Bonjour", es: "Hola" };
      expect(
        getLocalizedString(value, {
          preferredLocale: "it",
          defaultLocale: "pt",
          supportedLocales: ["fr", "de", "es"],
        })
      ).toBe("Bonjour");
    });

    it("should return first available value as last resort", () => {
      const value = { zh: "你好", ja: "こんにちは" };
      const result = getLocalizedString(value);
      expect(["你好", "こんにちは"]).toContain(result);
    });

    it("should handle empty localized string object", () => {
      expect(getLocalizedString({})).toBe("");
    });

    it("should use default locale if no preferred locale provided", () => {
      const value = { en: "Hello", de: "Hallo" };
      expect(getLocalizedString(value, { defaultLocale: "de" })).toBe("Hallo");
    });

    it("should default to en when no options provided", () => {
      const value = { en: "Hello", de: "Hallo" };
      expect(getLocalizedString(value)).toBe("Hello");
    });

    it("should handle edge cases", () => {
      // Very long strings
      const longString = "a".repeat(10000);
      expect(getLocalizedString({ en: longString })).toBe(longString);

      // Special characters
      const special = { en: "Hello\nWorld\t!", emoji: "👋🌍" };
      expect(getLocalizedString(special, { preferredLocale: "emoji" })).toBe(
        "👋🌍"
      );

      // Numeric-looking locale keys
      const numeric = { "123": "Numbers", en: "English" };
      expect(getLocalizedString(numeric, { preferredLocale: "123" })).toBe(
        "Numbers"
      );

      // Whitespace is preserved (not trimmed)
      const whitespace = { en: "   ", de: "Hallo" };
      expect(getLocalizedString(whitespace, { preferredLocale: "en" })).toBe(
        "   "
      );
    });
  });

  describe("getAvailableLocales", () => {
    it("should return empty array for string values", () => {
      expect(getAvailableLocales("Hello")).toEqual([]);
    });

    it("should return all locales with non-empty values", () => {
      const value = { en: "Hello", de: "Hallo", fr: "Bonjour" };
      expect(getAvailableLocales(value)).toEqual(
        expect.arrayContaining(["en", "de", "fr"])
      );
      expect(getAvailableLocales(value)).toHaveLength(3);
    });

    it("should filter out empty string values", () => {
      const value = { en: "Hello", de: "", fr: "Bonjour" };
      expect(getAvailableLocales(value)).toEqual(
        expect.arrayContaining(["en", "fr"])
      );
      expect(getAvailableLocales(value)).toHaveLength(2);
    });

    it("should handle empty object", () => {
      expect(getAvailableLocales({})).toEqual([]);
    });

    it("should handle object with all empty values", () => {
      const value = { en: "", de: "", fr: "" };
      expect(getAvailableLocales(value)).toEqual([]);
    });
  });

  describe("isLocalizedString", () => {
    it("should return true for localized string objects", () => {
      expect(isLocalizedString({ en: "Hello" })).toBe(true);
      expect(isLocalizedString({ en: "Hello", de: "Hallo" })).toBe(true);
    });

    it("should return false for non-objects", () => {
      expect(isLocalizedString("string")).toBe(false);
      expect(isLocalizedString(123)).toBe(false);
      expect(isLocalizedString(null)).toBe(false);
      expect(isLocalizedString(undefined)).toBe(false);
    });

    it("should return false for arrays", () => {
      expect(isLocalizedString([])).toBe(false);
      expect(isLocalizedString(["en", "de"])).toBe(false);
    });

    it("should return false for empty objects", () => {
      expect(isLocalizedString({})).toBe(false);
    });
  });

  describe("detectLocale", () => {
    const originalWindow = global.window;
    const originalNavigator = global.navigator;

    beforeEach(() => {
      // Reset window for each test
      delete (global as any).window;
      delete (global as any).navigator;
    });

    afterEach(() => {
      global.window = originalWindow;
      global.navigator = originalNavigator;
    });

    it("should return default locale in server environment", () => {
      expect(detectLocale("en", ["en", "de"])).toBe("en");
      expect(detectLocale("de", ["en", "de"])).toBe("de");
    });

    it("should detect locale from URL parameter", () => {
      (global as any).window = {
        location: {
          search: "?lang=de",
          pathname: "/",
        },
      };
      expect(detectLocale("en", ["en", "de"])).toBe("de");
    });

    it("should detect locale from path segment", () => {
      (global as any).window = {
        location: {
          search: "",
          pathname: "/de/page",
        },
      };
      expect(detectLocale("en", ["en", "de"])).toBe("de");
    });

    it("should detect locale from browser language", () => {
      (global as any).window = {
        location: {
          search: "",
          pathname: "/page",
        },
      };
      (global as any).navigator = {
        language: "de-DE",
      };
      expect(detectLocale("en", ["en", "de"])).toBe("de");
    });

    it("should fallback to default locale", () => {
      (global as any).window = {
        location: {
          search: "",
          pathname: "/page",
        },
      };
      (global as any).navigator = {
        language: "fr-FR",
      };
      expect(detectLocale("en", ["en", "de"])).toBe("en");
    });

    it("should ignore unsupported locales", () => {
      (global as any).window = {
        location: {
          search: "?lang=fr",
          pathname: "/",
        },
      };
      expect(detectLocale("en", ["en", "de"])).toBe("en");
    });
  });

  describe("formatLocaleForHtml", () => {
    it("should format known locales", () => {
      expect(formatLocaleForHtml("en")).toBe("en-US");
      expect(formatLocaleForHtml("de")).toBe("de-DE");
      expect(formatLocaleForHtml("fr")).toBe("fr-FR");
      expect(formatLocaleForHtml("es")).toBe("es-ES");
      expect(formatLocaleForHtml("it")).toBe("it-IT");
    });

    it("should return unknown locales as-is", () => {
      expect(formatLocaleForHtml("jp")).toBe("jp");
      expect(formatLocaleForHtml("zh")).toBe("zh");
    });

    it("should handle already formatted locales", () => {
      expect(formatLocaleForHtml("en-GB")).toBe("en-GB");
    });
  });
});
