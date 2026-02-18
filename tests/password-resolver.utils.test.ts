import { describe, expect, it } from "vitest";
import {
  isPasswordProtected,
  filterPasswordProtectedContent,
} from "../src/password-resolver.utils";

describe("password-resolver.utils", () => {
  describe("isPasswordProtected", () => {
    it("returns true when password_protected is true", () => {
      expect(isPasswordProtected(true)).toBe(true);
    });

    it("returns false when password_protected is false", () => {
      expect(isPasswordProtected(false)).toBe(false);
    });

    it("returns false when password_protected is undefined", () => {
      expect(isPasswordProtected(undefined)).toBe(false);
    });

    it("returns false when password_protected is null (as unknown)", () => {
      expect(isPasswordProtected(null as unknown as boolean)).toBe(false);
    });

    it("returns false for other falsy/truthy values", () => {
      expect(isPasswordProtected(0)).toBe(false);
      expect(isPasswordProtected("")).toBe(false);
      expect(isPasswordProtected(1)).toBe(false);
      expect(isPasswordProtected("true")).toBe(false);
    });
  });

  describe("filterPasswordProtectedContent", () => {
    it("filters out protected items", () => {
      const items = [
        { id: 1, title: "Public", password_protected: false },
        { id: 2, title: "Protected", password_protected: true },
        { id: 3, title: "Another Public", password_protected: false },
      ];
      const result = filterPasswordProtectedContent(items);
      expect(result).toEqual([
        { id: 1, title: "Public", password_protected: false },
        { id: 3, title: "Another Public", password_protected: false },
      ]);
    });

    it("keeps non-protected items", () => {
      const items = [
        { id: 1, password_protected: false },
        { id: 2 },
        { id: 3, password_protected: undefined },
      ];
      const result = filterPasswordProtectedContent(items);
      expect(result).toEqual(items);
    });

    it("handles empty array", () => {
      const result = filterPasswordProtectedContent([]);
      expect(result).toEqual([]);
    });

    it("handles all protected", () => {
      const items = [
        { id: 1, password_protected: true },
        { id: 2, password_protected: true },
      ];
      const result = filterPasswordProtectedContent(items);
      expect(result).toEqual([]);
    });

    it("handles mix of protected and non-protected", () => {
      const items = [
        { id: 1, password_protected: true },
        { id: 2, password_protected: false },
        { id: 3 },
      ];
      const result = filterPasswordProtectedContent(items);
      expect(result).toEqual([{ id: 2, password_protected: false }, { id: 3 }]);
    });

    it("preserves item shape and extra properties", () => {
      const items = [
        {
          id: "a",
          title: "Post",
          slug: "post",
          password_protected: false,
          meta: { author: "Alice" },
        },
      ];
      const result = filterPasswordProtectedContent(items);
      expect(result).toEqual(items);
    });
  });
});
