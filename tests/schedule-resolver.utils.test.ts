import { describe, expect, it } from "vitest";
import {
  isContentVisible,
  filterScheduledContent,
} from "../src/schedule-resolver.utils";

describe("schedule-resolver.utils", () => {
  const baseDate = "2025-02-11T12:00:00.000Z";

  describe("isContentVisible", () => {
    it("is visible when no schedule (null/undefined publish and expire)", () => {
      const now = new Date(baseDate);
      expect(isContentVisible(null, null, now)).toBe(true);
      expect(isContentVisible(undefined, undefined, now)).toBe(true);
      expect(isContentVisible(null, undefined, now)).toBe(true);
      expect(isContentVisible(undefined, null, now)).toBe(true);
    });

    it("is not visible before publish_at", () => {
      const now = new Date("2025-02-11T12:00:00.000Z");
      const publishAt = "2025-02-12T00:00:00.000Z"; // Future
      expect(isContentVisible(publishAt, null, now)).toBe(false);
    });

    it("is visible after publish_at", () => {
      const now = new Date("2025-02-12T00:00:01.000Z");
      const publishAt = "2025-02-12T00:00:00.000Z";
      expect(isContentVisible(publishAt, null, now)).toBe(true);
    });

    it("is visible exactly at publish_at", () => {
      const now = new Date("2025-02-12T00:00:00.000Z");
      const publishAt = "2025-02-12T00:00:00.000Z";
      expect(isContentVisible(publishAt, null, now)).toBe(true);
    });

    it("is not visible after expires_at", () => {
      const now = new Date("2025-02-12T00:00:01.000Z");
      const expiresAt = "2025-02-12T00:00:00.000Z";
      expect(isContentVisible(null, expiresAt, now)).toBe(false);
    });

    it("is visible before expires_at", () => {
      const now = new Date("2025-02-11T12:00:00.000Z");
      const expiresAt = "2025-02-12T00:00:00.000Z";
      expect(isContentVisible(null, expiresAt, now)).toBe(true);
    });

    it("is visible exactly at expires_at (excluded by >=)", () => {
      const now = new Date("2025-02-12T00:00:00.000Z");
      const expiresAt = "2025-02-12T00:00:00.000Z";
      expect(isContentVisible(null, expiresAt, now)).toBe(false);
    });

    it("is visible between publish_at and expires_at", () => {
      const now = new Date("2025-02-11T18:00:00.000Z");
      const publishAt = "2025-02-11T12:00:00.000Z";
      const expiresAt = "2025-02-12T00:00:00.000Z";
      expect(isContentVisible(publishAt, expiresAt, now)).toBe(true);
    });

    it("handles null publish_at", () => {
      const now = new Date(baseDate);
      expect(isContentVisible(null, "2025-02-12T00:00:00.000Z", now)).toBe(
        true
      );
      const futureNow = new Date("2025-02-13T00:00:00.000Z");
      expect(
        isContentVisible(null, "2025-02-12T00:00:00.000Z", futureNow)
      ).toBe(false);
    });

    it("handles undefined publish_at and expires_at", () => {
      const now = new Date(baseDate);
      expect(isContentVisible(undefined, undefined, now)).toBe(true);
    });

    it("uses default Date when now is omitted", () => {
      // Can't test exact value, but we can verify it doesn't throw
      const result = isContentVisible(null, null);
      expect(typeof result).toBe("boolean");
    });
  });

  describe("filterScheduledContent", () => {
    it("filters items based on schedule", () => {
      const now = new Date("2025-02-11T12:00:00.000Z");
      const items = [
        {
          id: 1,
          title: "Visible - no schedule",
          publish_at: undefined,
          expires_at: undefined,
        },
        {
          id: 2,
          title: "Visible - published",
          publish_at: "2025-02-10T00:00:00.000Z",
          expires_at: undefined,
        },
        {
          id: 3,
          title: "Hidden - not yet published",
          publish_at: "2025-02-12T00:00:00.000Z",
          expires_at: undefined,
        },
        {
          id: 4,
          title: "Hidden - expired",
          publish_at: "2025-02-01T00:00:00.000Z",
          expires_at: "2025-02-10T00:00:00.000Z",
        },
      ];
      const result = filterScheduledContent(items, now);
      expect(result).toHaveLength(2);
      expect(result.map(r => r.id)).toEqual([1, 2]);
    });

    it("handles empty array", () => {
      const result = filterScheduledContent([]);
      expect(result).toEqual([]);
    });

    it("handles all visible", () => {
      const now = new Date("2025-02-11T12:00:00.000Z");
      const items = [
        { id: 1, publish_at: undefined },
        { id: 2, publish_at: "2025-02-01T00:00:00.000Z" },
      ];
      const result = filterScheduledContent(items, now);
      expect(result).toHaveLength(2);
    });

    it("handles all expired", () => {
      const now = new Date("2025-02-15T00:00:00.000Z");
      const items = [
        { id: 1, expires_at: "2025-02-10T00:00:00.000Z" },
        { id: 2, expires_at: "2025-02-12T00:00:00.000Z" },
      ];
      const result = filterScheduledContent(items, now);
      expect(result).toEqual([]);
    });

    it("preserves item shape", () => {
      const now = new Date("2025-02-11T12:00:00.000Z");
      const items = [
        {
          id: "a",
          title: "Post",
          publish_at: "2025-02-01T00:00:00.000Z",
          expires_at: undefined,
        },
      ];
      const result = filterScheduledContent(items, now);
      expect(result[0]).toEqual(items[0]);
    });
  });
});
