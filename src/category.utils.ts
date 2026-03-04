/**
 * Category utility functions
 */

import type { Category } from "@otl-core/cms-types";

/**
 * Tree node with children
 */
export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

/**
 * Builds a hierarchical tree from flat category array
 * @param categories Flat array of categories
 * @returns Array of root-level categories with nested children
 */
export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  // Create a map for quick lookup
  const categoryMap = new Map<string, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  // First pass: create tree nodes
  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  // Second pass: build hierarchy
  categories.forEach((category) => {
    const node = categoryMap.get(category.id);
    if (!node) return;

    if (category.parent_id) {
      const parent = categoryMap.get(category.parent_id);
      if (parent) {
        parent.children.push(node);
      } else {
        // Parent not found, treat as root
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  // Sort roots and children by sort_order
  const sortByOrder = (a: CategoryTreeNode, b: CategoryTreeNode) =>
    a.sort_order - b.sort_order;

  roots.sort(sortByOrder);
  categoryMap.forEach((node) => {
    node.children.sort(sortByOrder);
  });

  return roots;
}

/**
 * Flattens a category tree back to a flat array
 * @param tree Hierarchical category tree
 * @returns Flat array of categories
 */
export function flattenCategoryTree(tree: CategoryTreeNode[]): Category[] {
  const result: Category[] = [];

  const flatten = (nodes: CategoryTreeNode[]) => {
    nodes.forEach((node) => {
      const { children, ...category } = node;
      result.push(category as Category);
      if (children.length > 0) {
        flatten(children);
      }
    });
  };

  flatten(tree);
  return result;
}

/**
 * Gets the full path of a category (all ancestors)
 * @param categoryId Category ID to get path for
 * @param categories Flat array of all categories
 * @param locale Locale to use for names (optional)
 * @returns Array of categories from root to target
 */
export function getCategoryPath(
  categoryId: string,
  categories: Category[],
  locale?: string,
): Category[] {
  const categoryMap = new Map<string, Category>();
  categories.forEach((cat) => categoryMap.set(cat.id, cat));

  const path: Category[] = [];
  let currentId: string | null | undefined = categoryId;

  while (currentId) {
    const category = categoryMap.get(currentId);
    if (!category) break;

    path.unshift(category);
    currentId = category.parent_id;
  }

  return path;
}

/**
 * Gets the display name for a category in a specific locale
 * @param category Category object
 * @param locale Locale code (e.g., 'en', 'de-DE')
 * @param fallbackLocale Fallback locale if primary not found
 * @returns Display name string
 */
export function getCategoryName(
  category: Category,
  locale: string,
  fallbackLocale = "en",
): string {
  if (typeof category.name === "string") {
    return category.name;
  }

  return (
    category.name[locale] ||
    category.name[fallbackLocale] ||
    Object.values(category.name)[0] ||
    "Untitled"
  );
}

/**
 * Gets the slug for a category in a specific locale
 * @param category Category object
 * @param locale Locale code
 * @param fallbackLocale Fallback locale if primary not found
 * @returns Slug string
 */
export function getCategorySlug(
  category: Category,
  locale: string,
  fallbackLocale = "en",
): string {
  if (typeof category.slug === "string") {
    return category.slug;
  }

  return (
    category.slug[locale] ||
    category.slug[fallbackLocale] ||
    Object.values(category.slug)[0] ||
    ""
  );
}

/**
 * Checks if a category is an ancestor of another category
 * @param ancestorId Potential ancestor category ID
 * @param descendantId Descendant category ID
 * @param categories Flat array of all categories
 * @returns True if ancestorId is an ancestor of descendantId
 */
export function isAncestor(
  ancestorId: string,
  descendantId: string,
  categories: Category[],
): boolean {
  const categoryMap = new Map<string, Category>();
  categories.forEach((cat) => categoryMap.set(cat.id, cat));

  let currentId: string | null | undefined = descendantId;

  while (currentId) {
    const category = categoryMap.get(currentId);
    if (!category) break;

    if (category.parent_id === ancestorId) {
      return true;
    }

    currentId = category.parent_id;
  }

  return false;
}

/**
 * Gets all descendants of a category (recursive)
 * @param categoryId Parent category ID
 * @param categories Flat array of all categories
 * @returns Array of all descendant categories
 */
export function getDescendants(
  categoryId: string,
  categories: Category[],
): Category[] {
  const descendants: Category[] = [];

  const findChildren = (parentId: string) => {
    const children = categories.filter((cat) => cat.parent_id === parentId);
    children.forEach((child) => {
      descendants.push(child);
      findChildren(child.id);
    });
  };

  findChildren(categoryId);
  return descendants;
}

/**
 * Finds a category by slug in a specific locale
 * @param slug Slug to search for
 * @param locale Locale code
 * @param categories Flat array of all categories
 * @returns Category if found, undefined otherwise
 */
export function findCategoryBySlug(
  slug: string,
  locale: string,
  categories: Category[],
): Category | undefined {
  return categories.find((cat) => {
    const categorySlug =
      typeof cat.slug === "string" ? cat.slug : cat.slug[locale];
    return categorySlug === slug;
  });
}
