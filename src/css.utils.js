/**
 * CSS Resolution Utilities
 * Converts CMS type system values (ColorReference, BorderConfig, ResponsiveValue)
 * into CSS strings for rendering.
 */
import { isResponsiveConfig } from "./responsive.utils";
/**
 * Minify CSS by removing comments, extra whitespace, and unnecessary characters
 */
export function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>+~()[\]])\s*/g, "$1")
    .replace(/:\s+/g, ":")
    .replace(/;}/g, "}")
    .replace(/:0px/g, ":0")
    .replace(/:0em/g, ":0")
    .replace(/:0rem/g, ":0")
    .trim();
}
/**
 * Resolve a ColorReference to a CSS color string
 */
export function resolveColorToCSS(colorRef, target) {
  if (!colorRef) return undefined;
  if (typeof colorRef !== "object") return undefined;
  // Determine which target to use: parameter, or colorRef.target (if exists), or default to background
  const resolvedTarget =
    target ??
    (colorRef.type !== "custom" ? colorRef.target : undefined) ??
    "background";
  if (colorRef.type === "custom") {
    if (typeof colorRef.value === "string") {
      return resolvedTarget === "foreground" ? undefined : colorRef.value;
    }
    return resolvedTarget === "foreground"
      ? colorRef.value.foreground
      : colorRef.value.background;
  } else if (colorRef.type === "theme") {
    return resolvedTarget === "foreground"
      ? `var(--${colorRef.value}-foreground)`
      : `var(--${colorRef.value})`;
  } else if (colorRef.type === "variable") {
    return resolvedTarget === "foreground"
      ? `var(--${colorRef.value}-foreground)`
      : `var(--${colorRef.value})`;
  }
  return undefined;
}
/**
 * Resolve multiple ColorReferences to CSS color strings
 */
export function resolveColorsToCSS(colorRefs) {
  const resolved = {};
  for (const key in colorRefs) {
    const colorRef = colorRefs[key];
    if (colorRef) {
      const color = resolveColorToCSS(colorRef);
      if (color) {
        resolved[key] = color;
      }
    }
  }
  return resolved;
}
/**
 * Resolve a BorderConfig to CSS border properties
 */
export function resolveBorderToCSS(borderConfig) {
  if (!borderConfig) return undefined;
  const result = {};
  const resolveSide = (side, defaultWidth, defaultStyle, defaultColor) => {
    const width = side?.width || defaultWidth;
    const style = side?.style || defaultStyle;
    const color = side?.color || defaultColor;
    if (!width || !style || !color) return undefined;
    const resolvedColor = resolveColorToCSS(color);
    if (!resolvedColor) return undefined;
    return `${width} ${style} ${resolvedColor}`;
  };
  const hasIndividualSides =
    borderConfig.top ||
    borderConfig.right ||
    borderConfig.bottom ||
    borderConfig.left;
  if (hasIndividualSides) {
    const topBorder = resolveSide(
      borderConfig.top,
      borderConfig.width,
      borderConfig.style,
      borderConfig.color
    );
    if (topBorder) result.borderTop = topBorder;
    const rightBorder = resolveSide(
      borderConfig.right,
      borderConfig.width,
      borderConfig.style,
      borderConfig.color
    );
    if (rightBorder) result.borderRight = rightBorder;
    const bottomBorder = resolveSide(
      borderConfig.bottom,
      borderConfig.width,
      borderConfig.style,
      borderConfig.color
    );
    if (bottomBorder) result.borderBottom = bottomBorder;
    const leftBorder = resolveSide(
      borderConfig.left,
      borderConfig.width,
      borderConfig.style,
      borderConfig.color
    );
    if (leftBorder) result.borderLeft = leftBorder;
  } else if (borderConfig.width && borderConfig.style && borderConfig.color) {
    const color = resolveColorToCSS(borderConfig.color);
    if (color) {
      result.border = `${borderConfig.width} ${borderConfig.style} ${color}`;
    }
  }
  if (borderConfig.radius) {
    result.borderRadius = borderConfig.radius;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}
function normalizeResponsiveValue(value) {
  if (!value) return {};
  if (isResponsiveConfig(value)) {
    return {
      base: value.base,
      sm: value.sm,
      md: value.md,
      lg: value.lg,
      xl: value.xl,
    };
  }
  return { base: value };
}
const BREAKPOINTS = [
  { key: "Sm", minWidth: "640px" },
  { key: "Md", minWidth: "768px" },
  { key: "Lg", minWidth: "1024px" },
  { key: "Xl", minWidth: "1280px" },
];
/**
 * Generate responsive CSS for spacing (margin, padding, gap, border) with media queries
 */
export function generateResponsiveSpacingCSS(className, config) {
  const css = [];
  const targetClass = `.${className}`;
  const normalizedBorder = normalizeResponsiveValue(config.border);
  const normalizedMargin = normalizeResponsiveValue(config.margin);
  const normalizedPadding = normalizeResponsiveValue(config.padding);
  const normalizedGap = normalizeResponsiveValue(config.gap);
  const border = {
    base: normalizedBorder.base,
    sm: normalizedBorder.sm,
    md: normalizedBorder.md,
    lg: normalizedBorder.lg,
    xl: normalizedBorder.xl,
  };
  const margin = {
    base: normalizedMargin.base,
    sm: normalizedMargin.sm,
    md: normalizedMargin.md,
    lg: normalizedMargin.lg,
    xl: normalizedMargin.xl,
  };
  const padding = {
    base: normalizedPadding.base,
    sm: normalizedPadding.sm,
    md: normalizedPadding.md,
    lg: normalizedPadding.lg,
    xl: normalizedPadding.xl,
  };
  const gap = {
    base: normalizedGap.base,
    sm: normalizedGap.sm,
    md: normalizedGap.md,
    lg: normalizedGap.lg,
    xl: normalizedGap.xl,
  };
  const baseStyles = [];
  if (border.base) {
    const resolvedBorder = resolveBorderToCSS(border.base);
    if (resolvedBorder) {
      Object.entries(resolvedBorder).forEach(([prop, value]) => {
        if (value) {
          const cssProp = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
          baseStyles.push(`${cssProp}:${value}`);
        }
      });
    }
  }
  if (margin.base) {
    baseStyles.push(`margin:${margin.base}`);
  }
  if (padding.base) {
    baseStyles.push(`padding:${padding.base}`);
  }
  if (gap.base) {
    baseStyles.push(`gap:${gap.base}`);
  }
  if (baseStyles.length > 0) {
    css.push(`${targetClass}{${baseStyles.join(";")}}`);
  }
  BREAKPOINTS.forEach(({ key, minWidth }) => {
    const bpKey = key.toLowerCase();
    const borderBp = border[bpKey];
    const marginBp = margin[bpKey];
    const paddingBp = padding[bpKey];
    const gapBp = gap[bpKey];
    if (borderBp || marginBp || paddingBp || gapBp) {
      const styles = [];
      if (borderBp) {
        const resolvedBorderBp = resolveBorderToCSS(borderBp);
        if (resolvedBorderBp) {
          Object.entries(resolvedBorderBp).forEach(([prop, value]) => {
            if (value) {
              const cssProp = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
              styles.push(`${cssProp}:${value}`);
            }
          });
        }
      }
      if (marginBp) {
        styles.push(`margin:${marginBp}`);
      }
      if (paddingBp) {
        styles.push(`padding:${paddingBp}`);
      }
      if (gapBp) {
        styles.push(`gap:${gapBp}`);
      }
      if (styles.length > 0) {
        css.push(
          `@media(min-width:${minWidth}){${targetClass}{${styles.join(";")}}}`
        );
      }
    }
  });
  return css.length > 0 ? minifyCSS(css.join("")) : null;
}
/**
 * Check if a ResponsiveSpacingConfig has any margin values set
 */
export function hasAnyMargin(config) {
  if (config.margin) {
    if (isResponsiveConfig(config.margin)) {
      return !!(
        config.margin.base ||
        config.margin.sm ||
        config.margin.md ||
        config.margin.lg ||
        config.margin.xl
      );
    }
    return true;
  }
  return false;
}
/**
 * Map animation timing name to CSS timing function
 */
export function getAnimationTimingFunction(timing = "ease-in-out") {
  switch (timing) {
    case "ease":
      return "ease";
    case "ease-in":
      return "ease-in";
    case "ease-out":
      return "ease-out";
    case "ease-in-out":
      return "ease-in-out";
    case "linear":
      return "linear";
    case "spring":
      return "cubic-bezier(0.68,-0.55,0.265,1.55)";
    default:
      return "ease-in-out";
  }
}
