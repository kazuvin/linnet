# UI Component Catalog

`src/components/ui/` reference.

## Components

| Component | Variants                        | Sizes      | Notes                        |
| --------- | ------------------------------- | ---------- | ---------------------------- |
| Button    | primary, secondary, ghost       | sm, md, lg | -                            |
| Card      | default, outline                | -          | CardHeader/Content/Footer    |
| Input     | default, error                  | sm, md, lg | `size` prop                  |
| Badge     | default, success, warning, etc. | sm, md     | -                            |
| Label     | -                               | -          | `required` prop              |
| Dialog    | default, alert                  | sm, md, lg | ESC/overlay click supported  |
| Header    | -                               | -          | Compound (Logo, Nav, etc.)   |
| Container | -                               | sm~full    | Tailwind .container utility  |

## File Structure

```
src/components/ui/{name}/
├── {name}.tsx
├── {name}.stories.tsx
├── {name}.test.tsx
└── index.ts
```

## Style Patterns

```tsx
const baseStyles = "rounded-md transition-colors focus:ring-2 focus:outline-none";
const disabledStyles = "disabled:cursor-not-allowed disabled:opacity-50";

const variantStyles = {
  primary: "bg-foreground text-background hover:opacity-90",
  secondary: "bg-transparent text-foreground border border-foreground/20 hover:bg-foreground/5",
  ghost: "bg-transparent text-foreground hover:bg-foreground/10",
} as const;

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
} as const;
```

## Compound Components (shadcn style)

個別エクスポート採用（tree-shaking効率）:

```tsx
import { Dialog, DialogTrigger, DialogContent } from "@/components";

// NOT: <Dialog.Trigger />
```

## Radix UI Wrapper

```tsx
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { type ComponentProps } from "react";

type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & { size?: "sm" | "md" | "lg" };

// forwardRef不要 (React 19)
export function DialogContent({ className, size = "md", children, ...props }: DialogContentProps) {
  return <DialogPrimitive.Content className={cn(sizeStyles[size], className)} {...props}>{children}</DialogPrimitive.Content>;
}
```

## Storybook

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "UI/ComponentName",
  component: ComponentName,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { variant: "default" } };
```

## Tests

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

describe("ComponentName", () => {
  it("renders correctly", () => {
    render(<ComponentName>Test</ComponentName>);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("handles events", () => {
    const onClick = vi.fn();
    render(<ComponentName onClick={onClick}>Test</ComponentName>);
    fireEvent.click(screen.getByText("Test"));
    expect(onClick).toHaveBeenCalled();
  });
});
```

## Exports

```tsx
// ui/{name}/index.ts
export { Component, SubComponent } from "./component";
export type { ComponentProps } from "./component";

// ui/index.ts
export * from "./button";
export * from "./card";
// ...
```
