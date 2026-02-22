# Design Tokens

## globals.css

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* Primary (blue: 264) */
  --color-primary: oklch(0.55 0.22 264);
  --color-primary-hover: oklch(0.5 0.23 264);
  --color-primary-active: oklch(0.45 0.24 264);

  /* Neutral */
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.2 0 0);
  --color-surface: oklch(0.97 0 0);
  --color-surface-elevated: oklch(0.99 0 0);
  --color-border: oklch(0.92 0 0);
  --color-muted: oklch(0.55 0 0);

  /* Semantic */
  --color-success: oklch(0.72 0.19 145);
  --color-warning: oklch(0.75 0.18 75);
  --color-error: oklch(0.63 0.24 27);

  /* Typography */
  --font-sans: var(--font-geist-sans), system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;

  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 oklch(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px oklch(0 0 0 / 0.1);

  /* Animation */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
}

.dark {
  --color-primary: oklch(0.62 0.21 264);
  --color-background: oklch(0.15 0 0);
  --color-foreground: oklch(0.95 0 0);
  --color-surface: oklch(0.22 0 0);
  --color-border: oklch(0.27 0 0);
  --color-muted: oklch(0.7 0 0);
  --color-success: oklch(0.8 0.18 145);
  --color-warning: oklch(0.82 0.17 80);
  --color-error: oklch(0.7 0.19 25);
}

body {
  background: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-sans);
}
```

## oklch

`oklch(L C H)` - Lightness (0-1), Chroma (0-0.4+), Hue (0-360)

| Token     | Light                | Dark                 |
| --------- | -------------------- | -------------------- |
| primary   | oklch(0.55 0.22 264) | oklch(0.62 0.21 264) |
| success   | oklch(0.72 0.19 145) | oklch(0.80 0.18 145) |
| warning   | oklch(0.75 0.18 75)  | oklch(0.82 0.17 80)  |
| error     | oklch(0.63 0.24 27)  | oklch(0.70 0.19 25)  |

## Dark Mode Toggle

```tsx
document.documentElement.classList.toggle("dark");
```
