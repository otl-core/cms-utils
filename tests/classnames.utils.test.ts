import { describe, expect, it } from "vitest";
import { cn } from "../src/classnames.utils";

describe("Classnames Utils", () => {
  describe("cn", () => {
    it("should merge class names", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("should handle conditional classes", () => {
      expect(cn("foo", true && "bar", false && "baz")).toBe("foo bar");
      expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
    });

    it("should handle object syntax", () => {
      expect(cn({ foo: true, bar: false })).toBe("foo");
      expect(cn({ foo: true }, { bar: true })).toBe("foo bar");
    });

    it("should handle array syntax", () => {
      expect(cn(["foo", "bar"])).toBe("foo bar");
      expect(cn(["foo", false && "bar", "baz"])).toBe("foo baz");
    });

    it("should merge tailwind classes correctly", () => {
      // Later class should override earlier for same property
      expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
      expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    });

    it("should handle complex tailwind conflicts", () => {
      expect(cn("p-4", "px-2")).toBe("p-4 px-2"); // px-2 overrides p-4's padding-x
      expect(cn("bg-red-500 hover:bg-blue-500", "bg-green-500")).toBe(
        "hover:bg-blue-500 bg-green-500"
      );
    });

    it("should preserve non-conflicting classes", () => {
      const result1 = cn("text-lg font-bold", "text-xl");
      expect(result1).toContain("font-bold");
      expect(result1).toContain("text-xl");
      expect(result1).not.toContain("text-lg");

      const result2 = cn("p-4 m-2", "px-2");
      expect(result2).toContain("m-2");
      expect(result2).toContain("p-4");
      expect(result2).toContain("px-2");
    });

    it("should handle edge cases", () => {
      // Empty input
      expect(cn()).toBe("");
      expect(cn("")).toBe("");
      expect(cn("", "")).toBe("");

      // Whitespace
      expect(cn("  foo  ", "  bar  ")).toBe("foo bar");

      // Duplicate classes (may or may not be deduplicated depending on implementation)
      const dupes1 = cn("foo foo");
      expect(dupes1).toContain("foo");
      const dupes2 = cn("foo", "foo");
      expect(dupes2).toContain("foo");

      // Mixed types
      const mixed = cn("foo", { bar: true }, ["baz"], null, undefined, false);
      expect(mixed).toContain("foo");
      expect(mixed).toContain("bar");
      expect(mixed).toContain("baz");
    });

    it("should handle responsive classes", () => {
      expect(cn("text-sm md:text-lg", "lg:text-xl")).toBe(
        "text-sm md:text-lg lg:text-xl"
      );
      expect(cn("hidden md:block", "lg:flex")).toBe("hidden md:block lg:flex");
    });

    it("should handle important modifier", () => {
      const result1 = cn("!text-red-500", "text-blue-500");
      expect(result1).toContain("!text-red-500");

      const result2 = cn("text-red-500", "!text-blue-500");
      expect(result2).toContain("!text-blue-500");
    });

    it("should handle arbitrary values", () => {
      expect(cn("text-[14px]", "text-[16px]")).toBe("text-[16px]");
      expect(cn("bg-[#ff0000]", "bg-[#00ff00]")).toBe("bg-[#00ff00]");
    });
  });
});
