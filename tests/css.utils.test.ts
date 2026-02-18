/**
 * CSS Utilities Tests
 */

import type { BorderConfig, ColorReference } from "@otl-core/cms-types";
import {
  getAnimationTimingFunction,
  generateResponsiveSpacingCSS,
  hasAnyMargin,
  minifyCSS,
  resolveBorderToCSS,
  resolveColorToCSS,
  resolveColorsToCSS,
} from "../src/css.utils";
import { describe, expect, it } from "vitest";

describe("CSS Utilities", () => {
  describe("minifyCSS", () => {
    it("should remove comments", () => {
      expect(minifyCSS("/* comment */ .a { color: red; }")).toBe(
        ".a{color:red}"
      );
    });

    it("should remove extra whitespace", () => {
      expect(minifyCSS(".a  {  color:  red;  }")).toBe(".a{color:red}");
    });

    it("should remove trailing semicolons before closing brace", () => {
      expect(minifyCSS(".a { color: red; }")).toBe(".a{color:red}");
    });

    it("should replace 0px/0em/0rem with 0", () => {
      expect(minifyCSS(".a { margin: 0px; }")).toBe(".a{margin:0}");
      expect(minifyCSS(".a { margin: 0em; }")).toBe(".a{margin:0}");
      expect(minifyCSS(".a { margin: 0rem; }")).toBe(".a{margin:0}");
    });

    it("should handle empty input", () => {
      expect(minifyCSS("")).toBe("");
    });
  });

  describe("resolveColorToCSS", () => {
    it("should resolve custom string color", () => {
      const ref: ColorReference = { type: "custom", value: "#ff0000" };
      expect(resolveColorToCSS(ref)).toBe("#ff0000");
    });

    it("should resolve custom object color for background", () => {
      const ref: ColorReference = {
        type: "custom",
        value: { background: "#ff0000", foreground: "#ffffff" },
      };
      expect(resolveColorToCSS(ref)).toBe("#ff0000");
    });

    it("should resolve custom object color for foreground", () => {
      const ref: ColorReference = {
        type: "custom",
        value: { background: "#ff0000", foreground: "#ffffff" },
      };
      expect(resolveColorToCSS(ref, "foreground")).toBe("#ffffff");
    });

    it("should resolve custom string color foreground as undefined", () => {
      const ref: ColorReference = { type: "custom", value: "#ff0000" };
      expect(resolveColorToCSS(ref, "foreground")).toBeUndefined();
    });

    it("should resolve theme color", () => {
      const ref: ColorReference = { type: "theme", value: "primary" };
      expect(resolveColorToCSS(ref)).toBe("var(--primary)");
    });

    it("should resolve theme color foreground", () => {
      const ref: ColorReference = { type: "theme", value: "primary" };
      expect(resolveColorToCSS(ref, "foreground")).toBe(
        "var(--primary-foreground)"
      );
    });

    it("should resolve variable color", () => {
      const ref: ColorReference = { type: "variable", value: "brand-color" };
      expect(resolveColorToCSS(ref)).toBe("var(--brand-color)");
    });

    it("should resolve variable color foreground", () => {
      const ref: ColorReference = { type: "variable", value: "brand-color" };
      expect(resolveColorToCSS(ref, "foreground")).toBe(
        "var(--brand-color-foreground)"
      );
    });

    it("should respect target from colorRef when no explicit target", () => {
      const ref: ColorReference = {
        type: "theme",
        value: "primary",
        target: "foreground",
      };
      expect(resolveColorToCSS(ref)).toBe("var(--primary-foreground)");
    });

    it("should prefer explicit target over colorRef target", () => {
      const ref: ColorReference = {
        type: "theme",
        value: "primary",
        target: "foreground",
      };
      expect(resolveColorToCSS(ref, "background")).toBe("var(--primary)");
    });

    it("should return undefined for undefined input", () => {
      expect(resolveColorToCSS(undefined)).toBeUndefined();
    });
  });

  describe("resolveColorsToCSS", () => {
    it("should resolve multiple color references", () => {
      const colors = {
        bg: { type: "theme", value: "primary" } as ColorReference,
        text: { type: "theme", value: "secondary" } as ColorReference,
      };
      const result = resolveColorsToCSS(colors);
      expect(result.bg).toBe("var(--primary)");
      expect(result.text).toBe("var(--secondary)");
    });

    it("should skip undefined color references", () => {
      const colors = {
        bg: { type: "theme", value: "primary" } as ColorReference,
        text: undefined,
      };
      const result = resolveColorsToCSS(colors);
      expect(result.bg).toBe("var(--primary)");
      expect(result.text).toBeUndefined();
    });

    it("should return empty object for empty input", () => {
      expect(resolveColorsToCSS({})).toEqual({});
    });
  });

  describe("resolveBorderToCSS", () => {
    it("should resolve shorthand border", () => {
      const border: BorderConfig = {
        width: "1px",
        style: "solid",
        color: { type: "theme", value: "primary" },
      };
      const result = resolveBorderToCSS(border);
      expect(result).toEqual({
        border: "1px solid var(--primary)",
      });
    });

    it("should resolve individual side borders", () => {
      const border: BorderConfig = {
        width: "1px",
        style: "solid",
        color: { type: "theme", value: "primary" },
        top: {
          width: "2px",
          style: "dashed",
          color: { type: "custom", value: "red" },
        },
      };
      const result = resolveBorderToCSS(border);
      expect(result?.borderTop).toBe("2px dashed red");
    });

    it("should resolve border radius", () => {
      const border: BorderConfig = {
        width: "1px",
        style: "solid",
        color: { type: "custom", value: "#000" },
        radius: "8px",
      };
      const result = resolveBorderToCSS(border);
      expect(result?.borderRadius).toBe("8px");
    });

    it("should return undefined for undefined input", () => {
      expect(resolveBorderToCSS(undefined)).toBeUndefined();
    });

    it("should return undefined for incomplete border config", () => {
      const border = { width: "1px" } as BorderConfig;
      expect(resolveBorderToCSS(border)).toBeUndefined();
    });
  });

  describe("generateResponsiveSpacingCSS", () => {
    it("should generate base padding CSS", () => {
      const result = generateResponsiveSpacingCSS("test", {
        padding: "16px",
      });
      expect(result).toContain(".test{padding:16px}");
    });

    it("should generate base margin CSS", () => {
      const result = generateResponsiveSpacingCSS("test", {
        margin: "8px",
      });
      expect(result).toContain(".test{margin:8px}");
    });

    it("should generate base gap CSS", () => {
      const result = generateResponsiveSpacingCSS("test", {
        gap: "12px",
      });
      expect(result).toContain(".test{gap:12px}");
    });

    it("should generate responsive padding CSS", () => {
      const result = generateResponsiveSpacingCSS("test", {
        padding: { base: "8px", md: "16px", lg: "24px" },
      });
      expect(result).toContain(".test{padding:8px}");
      expect(result).toContain("@media(min-width:768px)");
      expect(result).toContain("@media(min-width:1024px)");
    });

    it("should generate responsive border CSS", () => {
      const result = generateResponsiveSpacingCSS("test", {
        border: {
          base: {
            width: "1px",
            style: "solid",
            color: { type: "custom", value: "#000" },
          },
        },
      });
      expect(result).toContain("border:1px solid #000");
    });

    it("should return null for empty config", () => {
      expect(generateResponsiveSpacingCSS("test", {})).toBeNull();
    });
  });

  describe("hasAnyMargin", () => {
    it("should return true for simple margin", () => {
      expect(hasAnyMargin({ margin: "8px" })).toBe(true);
    });

    it("should return true for responsive margin", () => {
      expect(hasAnyMargin({ margin: { base: "8px" } })).toBe(true);
    });

    it("should return false for no margin", () => {
      expect(hasAnyMargin({})).toBe(false);
    });

    it("should return true for non-responsive margin value (even empty object)", () => {
      // An empty object is not a ResponsiveConfig, so it's treated as a scalar value
      expect(hasAnyMargin({ margin: {} })).toBe(true);
    });
  });

  describe("getAnimationTimingFunction", () => {
    it("should return standard timing functions", () => {
      expect(getAnimationTimingFunction("ease")).toBe("ease");
      expect(getAnimationTimingFunction("ease-in")).toBe("ease-in");
      expect(getAnimationTimingFunction("ease-out")).toBe("ease-out");
      expect(getAnimationTimingFunction("ease-in-out")).toBe("ease-in-out");
      expect(getAnimationTimingFunction("linear")).toBe("linear");
    });

    it("should return cubic-bezier for spring", () => {
      expect(getAnimationTimingFunction("spring")).toBe(
        "cubic-bezier(0.68,-0.55,0.265,1.55)"
      );
    });

    it("should default to ease-in-out", () => {
      expect(getAnimationTimingFunction()).toBe("ease-in-out");
      expect(getAnimationTimingFunction("unknown")).toBe("ease-in-out");
    });
  });
});
