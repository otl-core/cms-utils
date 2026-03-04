# @otl-core/cms-utils

Shared utility functions for OTL CMS that work with types from `@otl-core/cms-types`.

## Installation

```bash
npm install @otl-core/cms-utils
```

## Usage

### Responsive Utilities

Utility functions for working with responsive values:

```typescript
import {
  isResponsiveConfig,
  getBreakpointValue,
  getDefinedBreakpoints,
  toResponsiveConfig,
  fromResponsiveConfig,
} from "@otl-core/cms-utils";
import type { ResponsiveValue } from "@otl-core/cms-types";

// Check if a value is responsive
const value: ResponsiveValue<string> = { base: "16px", md: "20px" };
if (isResponsiveConfig(value)) {
}

// Get value for a specific breakpoint
const mdValue = getBreakpointValue(value, "md"); // '20px'
const xlValue = getBreakpointValue(value, "xl"); // '16px' (falls back to base)

// Get all defined breakpoints
const breakpoints = getDefinedBreakpoints(value); // ['base', 'md']

// Convert to responsive config
const config = toResponsiveConfig({
  base: "1rem",
  lg: "1.5rem",
});

// Convert from responsive config
const flat = fromResponsiveConfig(config);
```

## Separation of Concerns

- **@otl-core/cms-types**: Type definitions only (no runtime code)
- **@otl-core/cms-utils**: Runtime utility functions that work with the types

This separation ensures:

- Types can be shared without bundling unnecessary code
- Utilities can be tree-shaken if not used
- Clear distinction between compile-time and runtime dependencies
