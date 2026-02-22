---
name: component-creator
description: Create React components following project conventions. Use when asked to create, add, or build components, UI elements, or features. Handles both presentation components (src/components/) and container/feature components (src/features/ with Jotai). For container components, also use jotai-patterns skill for atom design. For styling, also use project-design skill for design tokens.
---

# Component Creator

Related skills:
- **jotai-patterns**: Atom design for containers
- **project-design**: Styling (tokens, patterns)

## Decision Guide

| Request Type               | Type         | Location               |
| -------------------------- | ------------ | ---------------------- |
| Button, Input, Card, Modal | Presentation | `src/components/ui/`   |
| Header, Footer, Sidebar    | Presentation | `src/components/layout/` |
| Login form with auth logic | Container    | `src/features/auth/`   |
| Dashboard with data fetch  | Container    | `src/features/dashboard/` |

**Rule**: Jotai atoms or API calls → Container. Pure UI → Presentation.

## Existing UI Components

| Component | Variants                        | Sizes      |
| --------- | ------------------------------- | ---------- |
| Button    | primary, secondary, ghost       | sm, md, lg |
| Card      | default, outline                | -          |
| Input     | default, error                  | sm, md, lg |
| Badge     | default, success, warning, etc. | sm, md     |
| Dialog    | default, alert                  | sm, md, lg |

## Quick Start

### Presentation

```tsx
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return <button className={cn("rounded-md px-4 py-2", variantStyles[variant], className)} {...props} />;
}
```

### Container

```tsx
"use client";
import { useAtomValue, useSetAtom } from "jotai";
import { isLoadingAtom, loginAtom } from "../stores/auth-atoms";

export function LoginForm() {
  const isLoading = useAtomValue(isLoadingAtom);
  const login = useSetAtom(loginAtom);
  // ...
}
```

## References

- [presentation.md](references/presentation.md)
- [container.md](references/container.md)
- [ui-components.md](references/ui-components.md)

## Checklist

- [ ] Presentation or Container?
- [ ] Correct directory
- [ ] kebab-case files, PascalCase components
- [ ] `index.ts` exports
- [ ] `"use client"` for hooks
- [ ] Design tokens from **project-design**
