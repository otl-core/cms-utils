/**
 * Utility functions for working with responsive values
 */
/**
 * Normalize an optional `ResponsiveValue<T>` into a flat object where every
 * breakpoint key is optional. Useful for CSS generation loops.
 *
 * - `undefined`  -> `{}`
 * - `"8px"`      -> `{ base: "8px" }`
 * - `{ base: "8px", md: "16px" }` -> same
 */
export function normalizeResponsiveValue(value) {
  if (!value) return {};
  if (typeof value === "object" && value !== null && "base" in value) {
    return value;
  }
  return { base: value };
}
/**
 * Type guard to check if a value is a ResponsiveConfig
 * Requires the object to have a "base" property
 */
export function isResponsiveConfig(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    "base" in value &&
    !Array.isArray(value)
  );
}
/**
 * Get value for a specific breakpoint with fallback to base
 */
export function getBreakpointValue(value, breakpoint) {
  if (!isResponsiveConfig(value)) {
    return value;
  }
  // Return breakpoint-specific value or fall back to base
  return value[breakpoint] ?? value.base;
}
/**
 * Get all defined breakpoints in a responsive value
 */
export function getDefinedBreakpoints(value) {
  if (!isResponsiveConfig(value)) {
    return ["base"];
  }
  const breakpoints = ["base"];
  if (value.sm !== undefined) breakpoints.push("sm");
  if (value.md !== undefined) breakpoints.push("md");
  if (value.lg !== undefined) breakpoints.push("lg");
  if (value.xl !== undefined) breakpoints.push("xl");
  if (value["2xl"] !== undefined) breakpoints.push("2xl");
  return breakpoints;
}
/**
 * Convert a single value or responsive value to a ResponsiveConfig
 */
export function toResponsiveConfig(fields) {
  const config = { base: fields.base };
  if (fields.sm !== undefined) config.sm = fields.sm;
  if (fields.md !== undefined) config.md = fields.md;
  if (fields.lg !== undefined) config.lg = fields.lg;
  if (fields.xl !== undefined) config.xl = fields.xl;
  if (fields["2xl"] !== undefined) config["2xl"] = fields["2xl"];
  return config;
}
/**
 * Convert a ResponsiveConfig to flat breakpoint fields
 */
export function fromResponsiveConfig(value) {
  if (!isResponsiveConfig(value)) {
    return { base: value };
  }
  return {
    base: value.base,
    sm: value.sm,
    md: value.md,
    lg: value.lg,
    xl: value.xl,
    "2xl": value["2xl"],
  };
}
