import { describe, expect, it } from "vitest";
import {
  selectVariant,
  isMultivariateContent,
  resolvePageVariant,
  resolveBlogPostVariant,
  resolveFormVariantsInSections,
} from "../src/abn-resolver.utils";

describe("abn-resolver.utils", () => {
  describe("selectVariant", () => {
    it("throws when variants array is empty", () => {
      expect(() => selectVariant(0, [])).toThrow(
        "selectVariant: variants array must not be empty"
      );
    });

    it("returns the variant for a single variant", () => {
      expect(selectVariant(0, [{ id: "single", weight: 100 }])).toBe("single");
      expect(selectVariant(0.5, [{ id: "single", weight: 100 }])).toBe(
        "single"
      );
      expect(selectVariant(0.99, [{ id: "single", weight: 100 }])).toBe(
        "single"
      );
    });

    it("selects correctly with multiple variants with equal weights", () => {
      const variants = [
        { id: "a", weight: 50 },
        { id: "b", weight: 50 },
      ];
      expect(selectVariant(0, variants)).toBe("a");
      expect(selectVariant(0.25, variants)).toBe("a");
      expect(selectVariant(0.49, variants)).toBe("a");
      expect(selectVariant(0.5, variants)).toBe("b");
      expect(selectVariant(0.75, variants)).toBe("b");
      expect(selectVariant(0.99, variants)).toBe("b");
    });

    it("selects correctly with unequal weights", () => {
      const variants = [
        { id: "a", weight: 70 },
        { id: "b", weight: 30 },
      ];
      expect(selectVariant(0, variants)).toBe("a");
      expect(selectVariant(0.69, variants)).toBe("a");
      expect(selectVariant(0.7, variants)).toBe("b");
      expect(selectVariant(0.99, variants)).toBe("b");
    });

    it("bucket=0 selects first variant", () => {
      const variants = [
        { id: "first", weight: 10 },
        { id: "second", weight: 90 },
      ];
      expect(selectVariant(0, variants)).toBe("first");
    });

    it("bucket=0.99 selects last variant (handles floating point edge cases)", () => {
      const variants = [
        { id: "first", weight: 90 },
        { id: "second", weight: 10 },
      ];
      expect(selectVariant(0.99, variants)).toBe("second");
    });

    it("weights do not need to sum to 100", () => {
      const variants = [
        { id: "a", weight: 1 },
        { id: "b", weight: 2 },
        { id: "c", weight: 3 },
      ];
      // Normalized: a=1/6 (~0.167), b=2/6 (~0.333), c=3/6 (0.5). bucket < cumulative.
      expect(selectVariant(0, variants)).toBe("a");
      expect(selectVariant(0.16, variants)).toBe("a");
      expect(selectVariant(0.17, variants)).toBe("b");
      expect(selectVariant(0.49, variants)).toBe("b"); // just under 0.5
      expect(selectVariant(0.5, variants)).toBe("c"); // 0.5 is not < 0.5 for b
      expect(selectVariant(0.99, variants)).toBe("c");
    });

    it("handles three variants with equal split", () => {
      const variants = [
        { id: "a", weight: 1 },
        { id: "b", weight: 1 },
        { id: "c", weight: 1 },
      ];
      expect(selectVariant(0, variants)).toBe("a");
      expect(selectVariant(0.33, variants)).toBe("a");
      expect(selectVariant(0.34, variants)).toBe("b");
      expect(selectVariant(0.66, variants)).toBe("b");
      expect(selectVariant(0.67, variants)).toBe("c");
      expect(selectVariant(0.99, variants)).toBe("c");
    });
  });

  describe("isMultivariateContent", () => {
    it("returns true when multivariate=true and variants is array", () => {
      expect(isMultivariateContent({ multivariate: true, variants: [] })).toBe(
        true
      );
      expect(
        isMultivariateContent({
          multivariate: true,
          variants: [{ id: "a", weight: 50 }],
        })
      ).toBe(true);
    });

    it("returns false for non-multivariate", () => {
      expect(isMultivariateContent({ multivariate: false })).toBe(false);
      expect(isMultivariateContent({})).toBe(false);
      expect(isMultivariateContent({ multivariate: 1 })).toBe(false);
      expect(isMultivariateContent({ multivariate: "true" })).toBe(false);
    });

    it("returns false when variants is missing", () => {
      expect(isMultivariateContent({ multivariate: true })).toBe(false);
    });

    it("returns false when variants is not an array", () => {
      expect(
        isMultivariateContent({ multivariate: true, variants: null })
      ).toBe(false);
      expect(isMultivariateContent({ multivariate: true, variants: {} })).toBe(
        false
      );
      expect(
        isMultivariateContent({ multivariate: true, variants: "[]" })
      ).toBe(false);
    });
  });

  describe("resolvePageVariant", () => {
    it("selects correct variant based on bucket", () => {
      const content = {
        page: {},
        seo: {},
        multivariate: true as const,
        variants: [
          { id: "a", weight: 50, sections: [{ type: "section-a" }] },
          { id: "b", weight: 50, sections: [{ type: "section-b" }] },
        ],
      };
      const result0 = resolvePageVariant(content, 0);
      expect(result0.variantId).toBe("a");
      expect(result0.sections).toEqual([{ type: "section-a" }]);

      const result1 = resolvePageVariant(content, 0.6);
      expect(result1.variantId).toBe("b");
      expect(result1.sections).toEqual([{ type: "section-b" }]);
    });

    it("falls back to first variant if selected variant not found", () => {
      // Simulate case where selectVariant returns an id that doesn't match
      // (e.g. type coercion). The find returns undefined, so we use first variant.
      const content = {
        page: {},
        seo: {},
        multivariate: true as const,
        variants: [
          { id: "first", weight: 100, sections: [{ type: "fallback" }] },
        ],
      };
      const result = resolvePageVariant(content, 0);
      expect(result.variantId).toBe("first");
      expect(result.sections).toEqual([{ type: "fallback" }]);
    });
  });

  describe("resolveBlogPostVariant", () => {
    it("resolves multivariate blog post and mutates content in place", () => {
      const content: Record<string, unknown> = {
        layout: { header: "shared" },
        multivariate: true,
        variants: [{ id: "a", weight: 100, blocks: [{ type: "block-a" }] }],
      };
      resolveBlogPostVariant(content, 0);
      expect(content.blocks).toEqual([{ type: "block-a" }]);
      expect(content.multivariate).toBeUndefined();
      expect(content.variants).toBeUndefined();
    });

    it("selects correct variant based on bucket", () => {
      const content: Record<string, unknown> = {
        multivariate: true,
        variants: [
          { id: "a", weight: 50, blocks: [{ type: "block-a" }] },
          { id: "b", weight: 50, blocks: [{ type: "block-b" }] },
        ],
      };
      resolveBlogPostVariant(content, 0);
      expect(content.blocks).toEqual([{ type: "block-a" }]);

      const content2: Record<string, unknown> = {
        multivariate: true,
        variants: [
          { id: "a", weight: 50, blocks: [{ type: "block-a" }] },
          { id: "b", weight: 50, blocks: [{ type: "block-b" }] },
        ],
      };
      resolveBlogPostVariant(content2, 0.6);
      expect(content2.blocks).toEqual([{ type: "block-b" }]);
    });

    it("is no-op for non-multivariate content", () => {
      const content: Record<string, unknown> = {
        blocks: [{ type: "existing" }],
      };
      resolveBlogPostVariant(content, 0);
      expect(content).toEqual({ blocks: [{ type: "existing" }] });

      const content2: Record<string, unknown> = {
        multivariate: false,
        variants: [],
      };
      resolveBlogPostVariant(content2, 0);
      expect(content2.multivariate).toBe(false);
      expect(content2.variants).toEqual([]);
    });

    it("is no-op when variants is missing or not array", () => {
      const content1: Record<string, unknown> = { multivariate: true };
      resolveBlogPostVariant(content1, 0);
      expect(content1).toEqual({ multivariate: true });

      const content2: Record<string, unknown> = {
        multivariate: true,
        variants: null,
      };
      resolveBlogPostVariant(content2, 0);
      expect(content2).toEqual({ multivariate: true, variants: null });
    });

    it("falls back to first variant when selected variant not found", () => {
      const content: Record<string, unknown> = {
        multivariate: true,
        variants: [
          { id: 123, weight: 100, blocks: [{ type: "fallback-block" }] },
        ],
      };
      resolveBlogPostVariant(content, 0);
      expect(content.blocks).toEqual([{ type: "fallback-block" }]);
      expect(content.multivariate).toBeUndefined();
      expect(content.variants).toBeUndefined();
    });
  });

  describe("resolveFormVariantsInSections", () => {
    it("resolves form blocks with multivariate data", () => {
      const sections = [
        {
          type: "container",
          config: {
            children: [
              {
                type: "form",
                data: {
                  definition: { id: "form-1" },
                  multivariate: true,
                  variants: [
                    {
                      id: "v1",
                      weight: 100,
                      document: { fields: ["a"] },
                    },
                  ],
                },
              },
            ],
          },
        },
      ];
      const result = resolveFormVariantsInSections(sections, 0);
      expect(result).toEqual([
        {
          type: "container",
          config: {
            children: [
              {
                type: "form",
                data: {
                  definition: { id: "form-1" },
                  document: { fields: ["a"] },
                },
              },
            ],
          },
        },
      ]);
    });

    it("handles nested layout blocks with container-layout (children)", () => {
      const sections = [
        {
          type: "section",
          config: {
            children: [
              {
                type: "container-layout",
                config: {
                  children: [
                    {
                      type: "form",
                      data: {
                        definition: {},
                        multivariate: true,
                        variants: [
                          { id: "a", weight: 100, document: { x: 1 } },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ];
      const result = resolveFormVariantsInSections(
        sections as unknown[],
        0
      ) as typeof sections;
      expect(result[0].config.children[0].config.children[0].data).toEqual({
        definition: {},
        document: { x: 1 },
      });
    });

    it("handles nested layout blocks with grid-layout (child key)", () => {
      const sections = [
        {
          type: "section",
          config: {
            children: [
              {
                type: "grid-layout",
                config: {
                  child: [
                    {
                      type: "form",
                      data: {
                        definition: {},
                        multivariate: true,
                        variants: [
                          { id: "b", weight: 100, document: { y: 2 } },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ];
      const result = resolveFormVariantsInSections(
        sections as unknown[],
        0
      ) as typeof sections;
      expect(result[0].config.children[0].config.child[0].data).toEqual({
        definition: {},
        document: { y: 2 },
      });
    });

    it("leaves form blocks with empty variants array unchanged", () => {
      const sections = [
        {
          type: "section",
          config: {
            children: [
              {
                type: "form",
                data: {
                  definition: {},
                  multivariate: true,
                  variants: [],
                },
              },
            ],
          },
        },
      ];
      const result = resolveFormVariantsInSections(sections as unknown[], 0);
      expect(result).toEqual(sections);
    });

    it("leaves non-form blocks unchanged", () => {
      const sections = [
        {
          type: "section",
          config: {
            children: [
              { type: "heading", data: { text: "Hello" } },
              { type: "paragraph", data: { content: "Hi" } },
            ],
          },
        },
      ];
      const result = resolveFormVariantsInSections(sections as unknown[], 0);
      expect(result).toEqual(sections);
    });

    it("leaves form blocks without multivariate data unchanged", () => {
      const sections = [
        {
          type: "section",
          config: {
            children: [
              {
                type: "form",
                data: {
                  definition: {},
                  document: { existing: true },
                },
              },
            ],
          },
        },
      ];
      const result = resolveFormVariantsInSections(sections as unknown[], 0);
      expect(result).toEqual(sections);
    });

    it("handles non-array input", () => {
      expect(resolveFormVariantsInSections(null as unknown[], 0)).toBe(null);
      expect(resolveFormVariantsInSections(undefined as unknown[], 0)).toBe(
        undefined
      );
      expect(resolveFormVariantsInSections({} as unknown[], 0)).toEqual({});
    });

    it("passes through non-record section elements", () => {
      const sections = ["string", 123, null, { type: "section", config: {} }];
      const result = resolveFormVariantsInSections(
        sections as unknown[],
        0
      ) as unknown[];
      expect(result[0]).toBe("string");
      expect(result[1]).toBe(123);
      expect(result[2]).toBe(null);
      expect(result[3]).toEqual({ type: "section", config: {} });
    });

    it("passes through sections without config.children (config is object)", () => {
      const sections = [{ type: "section", config: { other: "value" } }];
      const result = resolveFormVariantsInSections(sections as unknown[], 0);
      expect(result).toEqual(sections);
    });

    it("passes through sections when config is not a record", () => {
      const sections = [{ type: "section", config: null }];
      const result = resolveFormVariantsInSections(sections as unknown[], 0);
      expect(result).toEqual(sections);
    });

    it("passes through blocks that are not records", () => {
      const sections = [
        {
          type: "section",
          config: {
            children: ["not-a-block", 42, null],
          },
        },
      ];
      const result = resolveFormVariantsInSections(sections as unknown[], 0);
      expect(result).toEqual(sections);
    });

    it("handles empty sections array", () => {
      const result = resolveFormVariantsInSections([], 0);
      expect(result).toEqual([]);
    });

    it("handles sections without config.children", () => {
      const sections = [{ type: "section" }];
      const result = resolveFormVariantsInSections(sections as unknown[], 0);
      expect(result).toEqual(sections);
    });

    it("handles mixed form and non-form blocks", () => {
      const sections = [
        {
          type: "section",
          config: {
            children: [
              { type: "heading", data: {} },
              {
                type: "form",
                data: {
                  definition: {},
                  multivariate: true,
                  variants: [
                    { id: "v1", weight: 100, document: { resolved: true } },
                  ],
                },
              },
              { type: "spacer" },
            ],
          },
        },
      ];
      const result = resolveFormVariantsInSections(
        sections as unknown[],
        0
      ) as unknown[];
      const children = (result[0] as Record<string, unknown>).config as Record<
        string,
        unknown
      >;
      const blocks = children.children as unknown[];
      expect(blocks[0]).toEqual({ type: "heading", data: {} });
      expect(blocks[1].data).toEqual({
        definition: {},
        document: { resolved: true },
      });
      expect(blocks[2]).toEqual({ type: "spacer" });
    });

    it("selects correct form variant based on bucket", () => {
      const sections = [
        {
          type: "section",
          config: {
            children: [
              {
                type: "form",
                data: {
                  definition: {},
                  multivariate: true,
                  variants: [
                    { id: "a", weight: 50, document: { v: "a" } },
                    { id: "b", weight: 50, document: { v: "b" } },
                  ],
                },
              },
            ],
          },
        },
      ];
      const resultA = resolveFormVariantsInSections(
        JSON.parse(JSON.stringify(sections)) as unknown[],
        0
      );
      const resultB = resolveFormVariantsInSections(
        JSON.parse(JSON.stringify(sections)) as unknown[],
        0.6
      );
      expect((resultA[0] as Record<string, unknown>).config).toBeDefined();
      const dataA = (
        (resultA[0] as Record<string, unknown>).config as Record<
          string,
          unknown
        >
      ).children as Record<string, unknown>[];
      const dataB = (
        (resultB[0] as Record<string, unknown>).config as Record<
          string,
          unknown
        >
      ).children as Record<string, unknown>[];
      expect((dataA[0] as Record<string, unknown>).data).toMatchObject({
        document: { v: "a" },
      });
      expect((dataB[0] as Record<string, unknown>).data).toMatchObject({
        document: { v: "b" },
      });
    });
  });
});
