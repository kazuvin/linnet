# Presentation Components

UI patterns: see [ui-components.md](ui-components.md)

## Directory

```
src/components/
├── ui/        # Primitives (Button, Input, Card)
├── layout/    # Layout (Header, Footer)
└── shared/    # Shared composites
```

## Naming

- Directory: kebab-case (`user-avatar/`)
- File: kebab-case (`user-avatar.tsx`)
- Component: PascalCase (`UserAvatar`)
- Props: `{Name}Props` (`UserAvatarProps`)

## Template

```tsx
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button className={cn("rounded-md font-medium transition-colors", variantStyles[variant], sizeStyles[size], className)} {...props}>
      {children}
    </button>
  );
}

const variantStyles = { primary: "bg-blue-600 text-white", secondary: "bg-gray-200", ghost: "bg-transparent" } as const;
const sizeStyles = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2", lg: "px-6 py-3 text-lg" } as const;
```

## Exports

```tsx
// components/ui/button/index.ts
export { Button } from "./button";
export type { ButtonProps } from "./button";
```

## Key Principles

1. No internal data state (props in, render out)
2. Extend native HTML: `ComponentProps<"element">`
3. Composable styling: accept `className`, merge with `cn()`
4. Typed variants (not magic strings)
5. Sensible defaults
6. No business logic / API calls
7. No global state (no Valtio, no Context)
8. No forwardRef (React 19: ref in ComponentProps)

## cn() Utility

```tsx
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Compound Components

```tsx
import { createContext, useContext, type ReactNode } from "react";

const CardContext = createContext<{ variant: "default" | "outlined" } | null>(null);

export function Card({ variant = "default", children }: { variant?: "default" | "outlined"; children: ReactNode }) {
  return (
    <CardContext.Provider value={{ variant }}>
      <div className={cn("rounded-lg", variantStyles[variant])}>{children}</div>
    </CardContext.Provider>
  );
}

Card.Header = ({ children }: { children: ReactNode }) => <div className="border-b p-4">{children}</div>;
Card.Body = ({ children }: { children: ReactNode }) => <div className="p-4">{children}</div>;
```
