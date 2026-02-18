/**
 * Tests for category utility functions
 */

import type { BlogCategory } from "@otl-core/cms-types";
import { describe, expect, it } from "vitest";
import {
  buildCategoryTree,
  findCategoryBySlug,
  flattenCategoryTree,
  getCategoryName,
  getCategoryPath,
  getCategorySlug,
  getDescendants,
  isAncestor,
} from "../src/category.utils";

describe("Category Utilities", () => {
  const mockCategories: BlogCategory[] = [
    {
      id: "cat-1",
      blog_id: "blog-1",
      parent_id: undefined,
      title: "Technology",
      is_visible: true,
      name: { en: "Technology", de: "Technologie" },
      slug: { en: "technology", de: "technologie" },
      description: { en: "Tech posts" },
      depth: 0,
      sort_order: 0,
      full_path: { en: "/technology", de: "/technologie" },
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    },
    {
      id: "cat-2",
      blog_id: "blog-1",
      parent_id: "cat-1",
      title: "Web Development",
      is_visible: true,
      name: { en: "Web Development", de: "Webentwicklung" },
      slug: { en: "web-dev", de: "web-entwicklung" },
      description: { en: "Web posts" },
      depth: 1,
      sort_order: 0,
      full_path: {
        en: "/technology/web-dev",
        de: "/technologie/web-entwicklung",
      },
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    },
    {
      id: "cat-3",
      blog_id: "blog-1",
      title: "React",
      is_visible: true,
      parent_id: "cat-2",
      name: { en: "React", de: "React" },
      slug: { en: "react", de: "react" },
      description: { en: "React posts" },
      depth: 2,
      sort_order: 0,
      full_path: {
        en: "/technology/web-dev/react",
        de: "/technologie/web-entwicklung/react",
      },
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    },
    {
      id: "cat-4",
      blog_id: "blog-1",
      parent_id: undefined,
      title: "Business",
      is_visible: true,
      name: { en: "Business", de: "Geschäft" },
      slug: { en: "business", de: "geschaeft" },
      description: { en: "Business posts" },
      depth: 0,
      sort_order: 1,
      full_path: { en: "/business", de: "/geschaeft" },
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    },
  ];

  describe("buildCategoryTree", () => {
    it("should build hierarchical tree from flat array", () => {
      const tree = buildCategoryTree(mockCategories);

      expect(tree).toHaveLength(2); // Two root categories
      expect(tree[0].id).toBe("cat-1");
      expect(tree[0].children).toHaveLength(1);
      expect(tree[0].children[0].id).toBe("cat-2");
      expect(tree[0].children[0].children).toHaveLength(1);
      expect(tree[0].children[0].children[0].id).toBe("cat-3");
      expect(tree[1].id).toBe("cat-4");
      expect(tree[1].children).toHaveLength(0);
    });

    it("should handle empty array", () => {
      const tree = buildCategoryTree([]);
      expect(tree).toHaveLength(0);
    });

    it("should sort by sort_order", () => {
      const unsorted = [...mockCategories].sort(() => Math.random() - 0.5);
      const tree = buildCategoryTree(unsorted);
      expect(tree[0].sort_order).toBeLessThan(tree[1].sort_order);
    });
  });

  describe("flattenCategoryTree", () => {
    it("should flatten tree to flat array", () => {
      const tree = buildCategoryTree(mockCategories);
      const flattened = flattenCategoryTree(tree);

      expect(flattened).toHaveLength(mockCategories.length);
      expect(flattened.map(c => c.id)).toContain("cat-1");
      expect(flattened.map(c => c.id)).toContain("cat-2");
      expect(flattened.map(c => c.id)).toContain("cat-3");
      expect(flattened.map(c => c.id)).toContain("cat-4");
    });

    it("should handle empty tree", () => {
      const flattened = flattenCategoryTree([]);
      expect(flattened).toHaveLength(0);
    });
  });

  describe("getCategoryPath", () => {
    it("should return path from root to target", () => {
      const path = getCategoryPath("cat-3", mockCategories);

      expect(path).toHaveLength(3);
      expect(path[0].id).toBe("cat-1");
      expect(path[1].id).toBe("cat-2");
      expect(path[2].id).toBe("cat-3");
    });

    it("should return single item for root category", () => {
      const path = getCategoryPath("cat-1", mockCategories);

      expect(path).toHaveLength(1);
      expect(path[0].id).toBe("cat-1");
    });

    it("should return empty array for non-existent category", () => {
      const path = getCategoryPath("non-existent", mockCategories);
      expect(path).toHaveLength(0);
    });
  });

  describe("getCategoryName", () => {
    it("should return name in specified locale", () => {
      const name = getCategoryName(mockCategories[0], "en");
      expect(name).toBe("Technology");
    });

    it("should return name in fallback locale", () => {
      const name = getCategoryName(mockCategories[0], "fr", "de");
      expect(name).toBe("Technologie");
    });

    it("should return first available name if locale not found", () => {
      const name = getCategoryName(mockCategories[0], "fr");
      expect(name).toMatch(/Technology|Technologie/);
    });

    it("should handle string name", () => {
      const cat: BlogCategory = {
        ...mockCategories[0],
        name: { en: "Simple Name" },
      };
      const name = getCategoryName(cat, "en");
      expect(name).toBe("Simple Name");
    });
  });

  describe("getCategorySlug", () => {
    it("should return slug in specified locale", () => {
      const slug = getCategorySlug(mockCategories[0], "en");
      expect(slug).toBe("technology");
    });

    it("should return slug in fallback locale", () => {
      const slug = getCategorySlug(mockCategories[0], "fr", "de");
      expect(slug).toBe("technologie");
    });

    it("should handle string slug", () => {
      const cat: BlogCategory = {
        ...mockCategories[0],
        slug: { en: "simple-slug" },
      };
      const slug = getCategorySlug(cat, "en");
      expect(slug).toBe("simple-slug");
    });
  });

  describe("isAncestor", () => {
    it("should return true for direct parent", () => {
      expect(isAncestor("cat-1", "cat-2", mockCategories)).toBe(true);
    });

    it("should return true for indirect ancestor", () => {
      expect(isAncestor("cat-1", "cat-3", mockCategories)).toBe(true);
    });

    it("should return false for non-ancestor", () => {
      expect(isAncestor("cat-4", "cat-3", mockCategories)).toBe(false);
    });

    it("should return false for same category", () => {
      expect(isAncestor("cat-1", "cat-1", mockCategories)).toBe(false);
    });
  });

  describe("getDescendants", () => {
    it("should return all descendants recursively", () => {
      const descendants = getDescendants("cat-1", mockCategories);

      expect(descendants).toHaveLength(2);
      expect(descendants.map(c => c.id)).toContain("cat-2");
      expect(descendants.map(c => c.id)).toContain("cat-3");
    });

    it("should return empty array for leaf category", () => {
      const descendants = getDescendants("cat-3", mockCategories);
      expect(descendants).toHaveLength(0);
    });

    it("should return empty array for non-existent category", () => {
      const descendants = getDescendants("non-existent", mockCategories);
      expect(descendants).toHaveLength(0);
    });
  });

  describe("findCategoryBySlug", () => {
    it("should find category by slug in specified locale", () => {
      const category = findCategoryBySlug("technology", "en", mockCategories);
      expect(category?.id).toBe("cat-1");
    });

    it("should find category in different locale", () => {
      const category = findCategoryBySlug("technologie", "de", mockCategories);
      expect(category?.id).toBe("cat-1");
    });

    it("should return undefined for non-existent slug", () => {
      const category = findCategoryBySlug("non-existent", "en", mockCategories);
      expect(category).toBeUndefined();
    });

    it("should handle string slugs", () => {
      const categories: BlogCategory[] = [
        {
          ...mockCategories[0],
          slug: { en: "string-slug" },
        },
      ];
      const category = findCategoryBySlug("string-slug", "en", categories);
      expect(category?.id).toBe("cat-1");
    });
  });
});
