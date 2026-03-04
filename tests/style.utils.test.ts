/**
 * Style Utilities Tests
 */

import {
  colorToStyle,
  gapToClass,
  paddingToClass,
  spacingToClass,
  widthToClass,
  borderToStyle,
  formatShadow,
  paddingTopToClass,
  paddingBottomToClass,
} from "../src/style.utils";
import { describe, expect, it } from "vitest";

describe("Style Utilities", () => {
  describe("paddingToClass", () => {
    it("should convert padding values to classes", () => {
      expect(paddingToClass("none")).toBe("p-0");
      expect(paddingToClass("sm")).toBe("p-4");
      expect(paddingToClass("normal")).toBe("p-8");
      expect(paddingToClass("lg")).toBe("p-12");
      expect(paddingToClass("xl")).toBe("p-16");
    });

    it("should return default for unknown values", () => {
      expect(paddingToClass("unknown")).toBe("p-8");
    });

    it("should return empty for undefined", () => {
      expect(paddingToClass()).toBe("");
    });
  });

  describe("paddingTopToClass", () => {
    it("should convert padding top values to classes", () => {
      expect(paddingTopToClass("none")).toBe("pt-0");
      expect(paddingTopToClass("sm")).toBe("pt-4");
      expect(paddingTopToClass("normal")).toBe("pt-8");
    });

    it("should return empty for undefined", () => {
      expect(paddingTopToClass()).toBe("");
    });
  });

  describe("paddingBottomToClass", () => {
    it("should convert padding bottom values to classes", () => {
      expect(paddingBottomToClass("none")).toBe("pb-0");
      expect(paddingBottomToClass("sm")).toBe("pb-4");
      expect(paddingBottomToClass("normal")).toBe("pb-8");
    });

    it("should return empty for undefined", () => {
      expect(paddingBottomToClass()).toBe("");
    });
  });

  describe("spacingToClass", () => {
    it("should convert spacing values to classes", () => {
      expect(spacingToClass("tight")).toBe("space-y-2");
      expect(spacingToClass("normal")).toBe("space-y-4");
      expect(spacingToClass("relaxed")).toBe("space-y-6");
      expect(spacingToClass("loose")).toBe("space-y-8");
    });
  });

  describe("widthToClass", () => {
    it("should convert width values to classes", () => {
      expect(widthToClass("full")).toBe("w-full");
      expect(widthToClass("container")).toBe("max-w-7xl mx-auto");
      expect(widthToClass("prose")).toBe("max-w-4xl mx-auto");
      expect(widthToClass("narrow")).toBe("max-w-2xl mx-auto");
    });
  });

  describe("colorToStyle", () => {
    it("should convert color to style object", () => {
      expect(colorToStyle("#ff0000")).toEqual({ backgroundColor: "#ff0000" });
    });

    it("should return empty object for undefined", () => {
      expect(colorToStyle()).toEqual({});
    });
  });

  describe("gapToClass", () => {
    it("should convert gap values to classes", () => {
      expect(gapToClass(0)).toBe("gap-0");
      expect(gapToClass(8)).toBe("gap-2");
      expect(gapToClass(16)).toBe("gap-4");
      expect(gapToClass(24)).toBe("gap-6");
      expect(gapToClass(32)).toBe("gap-8");
    });

    it("should return empty for undefined", () => {
      expect(gapToClass(undefined)).toBe("");
    });
  });

  describe("borderToStyle", () => {
    it("should convert border config to CSS", () => {
      const result = borderToStyle({
        width: "2px",
        style: "solid",
        color: "red",
      });
      expect(result).toBe("2px solid red");
    });

    it("should return empty string for undefined", () => {
      expect(borderToStyle(undefined)).toBe("");
    });
  });

  describe("formatShadow", () => {
    it("should format shadow config to CSS", () => {
      const result = formatShadow({
        offsetX: "0",
        offsetY: "4px",
        blurRadius: "6px",
        spreadRadius: "0",
        color: "rgba(0,0,0,0.1)",
        inset: false,
      });
      expect(result).toBe("0 4px 6px 0 rgba(0,0,0,0.1)");
    });

    it("should return empty string for undefined", () => {
      expect(formatShadow(undefined)).toBe("");
    });
  });
});
