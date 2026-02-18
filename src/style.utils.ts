/**
 * Style Utilities
 * Helpers to convert CMS config values to CSS strings and Tailwind classes.
 * For CSS resolution utilities (resolveColorToCSS, resolveBorderToCSS, etc.)
 * see css.utils.ts.
 */

import type {
  BorderConfig,
  ResponsiveValue,
  ShadowConfig,
} from "@otl-core/cms-types";

import { isResponsiveConfig } from "./responsive.utils";

/**
 * Get the base value from a ResponsiveValue, handling undefined input
 */
function getResponsiveBase<T>(
  value: ResponsiveValue<T> | undefined
): T | undefined {
  if (!value) return undefined;
  if (isResponsiveConfig(value)) {
    return value.base;
  }
  return value;
}

/**
 * Convert border config to CSS string
 */
export function borderToStyle(
  border: ResponsiveValue<BorderConfig> | undefined
): string {
  if (!border) return "";
  const borderValue = getResponsiveBase(border);
  if (!borderValue) return "";

  const width = borderValue.width || "1px";
  const style = borderValue.style || "solid";
  const color = borderValue.color || "currentColor";

  return `${width} ${style} ${color}`;
}

/**
 * Format shadow config to CSS box-shadow value
 */
export function formatShadow(shadow: ShadowConfig | undefined): string {
  if (!shadow) return "";

  const { offsetX, offsetY, blurRadius, spreadRadius, color } = shadow;

  return `${offsetX} ${offsetY} ${blurRadius} ${spreadRadius} ${color}`;
}

/**
 * Convert padding config to Tailwind class
 */
export function paddingToClass(padding?: string): string {
  if (!padding) return "";

  const paddingMap: Record<string, string> = {
    none: "p-0",
    sm: "p-4",
    normal: "p-8",
    lg: "p-12",
    xl: "p-16",
  };

  return paddingMap[padding] || paddingMap["normal"];
}

/**
 * Convert padding top config to Tailwind class
 */
export function paddingTopToClass(paddingTop?: string): string {
  if (!paddingTop) return "";

  const paddingMap: Record<string, string> = {
    none: "pt-0",
    sm: "pt-4",
    normal: "pt-8",
    lg: "pt-12",
    xl: "pt-16",
  };

  return paddingMap[paddingTop] || paddingMap["normal"];
}

/**
 * Convert padding bottom config to Tailwind class
 */
export function paddingBottomToClass(paddingBottom?: string): string {
  if (!paddingBottom) return "";

  const paddingMap: Record<string, string> = {
    none: "pb-0",
    sm: "pb-4",
    normal: "pb-8",
    lg: "pb-12",
    xl: "pb-16",
  };

  return paddingMap[paddingBottom] || paddingMap["normal"];
}

/**
 * Convert spacing config to Tailwind class
 */
export function spacingToClass(spacing?: string): string {
  if (!spacing) return "";

  const spacingMap: Record<string, string> = {
    tight: "space-y-2",
    normal: "space-y-4",
    relaxed: "space-y-6",
    loose: "space-y-8",
  };

  return spacingMap[spacing] || spacingMap["normal"];
}

/**
 * Convert max-width config to Tailwind class
 */
export function widthToClass(width?: string): string {
  if (!width) return "";

  const widthMap: Record<string, string> = {
    full: "w-full",
    container: "max-w-7xl mx-auto",
    wide: "max-w-6xl mx-auto",
    prose: "max-w-4xl mx-auto",
    narrow: "max-w-2xl mx-auto",
  };

  return widthMap[width] || widthMap["container"];
}

/**
 * Convert color config to inline style object
 */
export function colorToStyle(color?: string): { backgroundColor?: string } {
  if (!color) return {};

  return {
    backgroundColor: color,
  };
}

/**
 * Convert gap config to Tailwind class
 */
export function gapToClass(gap?: number): string {
  if (gap === undefined || gap === null) return "";

  // Convert pixel value to Tailwind spacing scale
  if (gap === 0) return "gap-0";
  if (gap <= 4) return "gap-1";
  if (gap <= 8) return "gap-2";
  if (gap <= 12) return "gap-3";
  if (gap <= 16) return "gap-4";
  if (gap <= 24) return "gap-6";
  if (gap <= 32) return "gap-8";
  if (gap <= 48) return "gap-12";

  return "gap-16";
}
