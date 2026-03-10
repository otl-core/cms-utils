import { describe, expect, it } from "vitest";
import { getLocalizedString } from "../src/localization.utils";

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
        "Hallo",
      );
      expect(getLocalizedString(value, { preferredLocale: "fr" })).toBe(
        "Bonjour",
      );
    });

    it("should fall back to default locale if preferred not available", () => {
      const value = { en: "Hello", de: "Hallo" };
      expect(
        getLocalizedString(value, {
          preferredLocale: "fr",
          defaultLocale: "de",
        }),
      ).toBe("Hallo");
    });

    it("should fall back to en if neither preferred nor default available", () => {
      const value = { en: "Hello", de: "Hallo" };
      expect(
        getLocalizedString(value, {
          preferredLocale: "fr",
          defaultLocale: "es",
        }),
      ).toBe("Hello");
    });

    it("should try supported locales if en not available", () => {
      const value = { de: "Hallo", fr: "Bonjour", es: "Hola" };
      expect(
        getLocalizedString(value, {
          preferredLocale: "it",
          defaultLocale: "pt",
          supportedLocales: ["fr", "de", "es"],
        }),
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
        "👋🌍",
      );

      // Numeric-looking locale keys
      const numeric = { "123": "Numbers", en: "English" };
      expect(getLocalizedString(numeric, { preferredLocale: "123" })).toBe(
        "Numbers",
      );

      // Whitespace is preserved (not trimmed)
      const whitespace = { en: "   ", de: "Hallo" };
      expect(getLocalizedString(whitespace, { preferredLocale: "en" })).toBe(
        "   ",
      );
    });
  });
});
