import { describe, expect, it } from "vitest";
import {
  getBreakpointValue,
  isResponsiveConfig,
} from "../src/responsive.utils";

describe("Responsive Utils", () => {
  describe("isResponsiveConfig", () => {
    it("should return true for responsive config with base", () => {
      expect(isResponsiveConfig({ base: "value" })).toBe(true);
      expect(isResponsiveConfig({ base: "value", md: "other" })).toBe(true);
    });

    it("should return false for non-objects", () => {
      expect(isResponsiveConfig("string")).toBe(false);
      expect(isResponsiveConfig(123)).toBe(false);
      expect(isResponsiveConfig(null)).toBe(false);
      expect(isResponsiveConfig(undefined)).toBe(false);
    });

    it("should return false for arrays", () => {
      expect(isResponsiveConfig([])).toBe(false);
      expect(isResponsiveConfig([1, 2, 3])).toBe(false);
    });

    it("should return false for objects without base", () => {
      // @ts-expect-error - we want to test the function with an object without base
      expect(isResponsiveConfig({ md: "value" })).toBe(false);
      // @ts-expect-error - we want to test the function with an object without base
      expect(isResponsiveConfig({ lg: "value", xl: "value" })).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(isResponsiveConfig({ base: null })).toBe(true); // base exists, even if null
      expect(isResponsiveConfig({ base: undefined })).toBe(true); // base exists, even if undefined
      expect(isResponsiveConfig({ base: 0 })).toBe(true);
      expect(isResponsiveConfig({ base: false })).toBe(true);
      expect(isResponsiveConfig({ base: "" })).toBe(true);
    });
  });

  describe("getBreakpointValue", () => {
    it("should return value directly for non-responsive values", () => {
      expect(getBreakpointValue("simple", "base")).toBe("simple");
      expect(getBreakpointValue(123, "md")).toBe(123);
    });

    it("should return base value when breakpoint not defined", () => {
      const config = { base: "base-value" };
      expect(getBreakpointValue(config, "md")).toBe("base-value");
      expect(getBreakpointValue(config, "lg")).toBe("base-value");
    });

    it("should return breakpoint-specific value when defined", () => {
      const config = {
        base: "base",
        md: "medium",
        lg: "large",
      };
      expect(getBreakpointValue(config, "base")).toBe("base");
      expect(getBreakpointValue(config, "md")).toBe("medium");
      expect(getBreakpointValue(config, "lg")).toBe("large");
    });

    it("should fall back to base for undefined breakpoints", () => {
      const config = { base: "fallback", lg: "large" };
      expect(getBreakpointValue(config, "sm")).toBe("fallback");
      expect(getBreakpointValue(config, "md")).toBe("fallback");
      expect(getBreakpointValue(config, "xl")).toBe("fallback");
    });
  });
});
