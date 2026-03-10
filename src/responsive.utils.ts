/**
 * Utility functions for working with responsive values
 */

import type {
  BreakpointWithBase,
  ResponsiveConfig,
  ResponsiveValue,
} from "@otl-core/cms-types";

/**
 * Type guard to check if a value is a ResponsiveConfig
 * Requires the object to have a "base" property
 */
export function isResponsiveConfig<T>(
  value: ResponsiveValue<T>,
): value is ResponsiveConfig<T> {
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
export function getBreakpointValue<T>(
  value: ResponsiveValue<T>,
  breakpoint: BreakpointWithBase,
): T {
  if (!isResponsiveConfig(value)) {
    return value;
  }

  // Return breakpoint-specific value or fall back to base
  return value[breakpoint] ?? value.base;
}
