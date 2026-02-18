/**
 * A/B/n Variant Resolver
 *
 * Framework-agnostic logic for resolving multivariate content to a single
 * variant per visitor. Uses a deterministic bucket value (float [0, 1))
 * to ensure sticky variant assignment.
 *
 * This module handles resolving only -- analytics and testing evaluation
 * happen separately downstream.
 */

/**
 * Given a bucket value [0, 1) and variant weights,
 * deterministically select a variant.
 *
 * The weights don't need to sum to 100 -- they are normalized.
 * A user with a given bucket will always get the same variant
 * for a given weight configuration.
 */
export function selectVariant(bucket, variants) {
  if (variants.length === 0) {
    throw new Error("selectVariant: variants array must not be empty");
  }
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  let cumulative = 0;
  for (const variant of variants) {
    cumulative += variant.weight / totalWeight;
    if (bucket < cumulative) {
      return variant.id;
    }
  }
  // Fallback to last variant (handles floating point edge cases)
  return variants[variants.length - 1].id;
}

/**
 * Check if page content is multivariate.
 */
export function isMultivariateContent(content) {
  return content.multivariate === true && Array.isArray(content.variants);
}

/**
 * Resolve multivariate page content to a single variant's sections.
 * Returns the selected sections array and the variant ID.
 */
export function resolvePageVariant(content, bucket) {
  const variantId = selectVariant(bucket, content.variants);
  const selectedVariant = content.variants.find(v => v.id === variantId);
  if (!selectedVariant) {
    // Fallback to first variant
    return {
      sections: content.variants[0].sections,
      variantId: content.variants[0].id,
    };
  }
  return { sections: selectedVariant.sections, variantId };
}

/**
 * Resolve multivariate blog post content to a single variant's blocks.
 * Blog post layouts are blog-level (no variants). The post's content blocks
 * are the variant data, returned alongside the shared layout.
 *
 * Mutates the content record in place: replaces "variants" with the selected "blocks".
 */
export function resolveBlogPostVariant(content, bucket) {
  if (!content.multivariate || !Array.isArray(content.variants)) return;
  const variants = content.variants;
  const variantConfigs = variants.map(v => ({
    id: String(v.id),
    weight: Number(v.weight),
  }));
  const selectedId = selectVariant(bucket, variantConfigs);
  const selectedVariant = variants.find(v => v.id === selectedId);
  if (selectedVariant) {
    content.blocks = selectedVariant.blocks;
  } else if (variants.length > 0) {
    content.blocks = variants[0].blocks;
  }
  // Clean up multivariate fields -- downstream only sees a single set of blocks
  delete content.multivariate;
  delete content.variants;
}

/**
 * Walk through sections/blocks and resolve any multivariate form block data.
 * This should be called on the server before passing data to client components,
 * so client-side FormBlock never has to deal with variant resolution.
 */
export function resolveFormVariantsInSections(sections, bucket) {
  if (!Array.isArray(sections)) return sections;
  return sections.map(section => {
    if (!isRecord(section)) return section;
    const config = section.config;
    if (!isRecord(config)) return section;
    // Process children blocks
    const children = config.children;
    if (!Array.isArray(children)) return section;
    const resolvedChildren = children.map(block =>
      resolveBlockVariant(block, bucket)
    );
    return {
      ...section,
      config: {
        ...config,
        children: resolvedChildren,
      },
    };
  });
}
/**
 * Recursively resolve a block's variant data.
 * - Form blocks with multivariate data get resolved to a single variant.
 * - Layout blocks (container-layout, grid-layout, flexbox-layout) recurse
 *   into their children so nested form blocks are also resolved.
 */
function resolveBlockVariant(block, bucket) {
  if (!isRecord(block)) return block;
  const blockType = block.type;
  // Form blocks: resolve multivariate data to a single variant
  if (blockType === "form") {
    const data = block.data;
    if (!isRecord(data) || data.multivariate !== true) return block;
    const variants = data.variants;
    if (!Array.isArray(variants) || variants.length === 0) return block;
    const variantConfigs = variants.filter(isRecord).map(v => ({
      id: String(v.id),
      weight: Number(v.weight),
    }));
    const selectedId = selectVariant(bucket, variantConfigs);
    const selectedVariant = variants.find(
      v => isRecord(v) && v.id === selectedId
    );
    if (!selectedVariant || !isRecord(selectedVariant)) return block;
    return {
      ...block,
      data: {
        definition: data.definition,
        document: selectedVariant.document,
      },
    };
  }
  // Layout blocks: recurse into nested children
  const config = block.config;
  if (!isRecord(config)) return block;
  // Layout blocks use "children" or "child" for nested blocks
  const childKey = Array.isArray(config.children)
    ? "children"
    : Array.isArray(config.child)
      ? "child"
      : null;
  if (!childKey) return block;
  const children = config[childKey];
  const resolvedChildren = children.map(child =>
    resolveBlockVariant(child, bucket)
  );
  return {
    ...block,
    config: {
      ...config,
      [childKey]: resolvedChildren,
    },
  };
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
