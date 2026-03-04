/**
 * Utility for merging Tailwind CSS class names
 * Combines clsx for conditional classes with tailwind-merge to handle conflicts
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names intelligently
 * - Uses clsx for conditional classes
 * - Uses tailwind-merge to deduplicate and resolve conflicts
 *
 * @example
 * cn("px-2 py-1", condition && "bg-blue-500")
 * cn({ "font-bold": isActive }, "text-lg")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
