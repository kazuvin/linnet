# Component Style Patterns

## Buttons

```tsx
// Primary
"bg-primary inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"

// Secondary
"bg-surface text-foreground border-border hover:bg-border/50 inline-flex items-center gap-2 rounded-md border px-4 py-2 font-medium transition-colors disabled:opacity-50"

// Ghost
"text-foreground hover:bg-surface inline-flex items-center gap-2 rounded-md px-4 py-2 transition-colors"

// Destructive
"bg-error rounded-md px-4 py-2 text-white hover:opacity-90"

// Sizes
sm: "px-3 py-1.5 text-sm rounded"
md: "px-4 py-2 text-base rounded-md"
lg: "px-6 py-3 text-lg rounded-lg"
```

## Form Elements

```tsx
// Input
"bg-background border-border text-foreground placeholder:text-muted focus:ring-primary/50 focus:border-primary w-full rounded-md border px-3 py-2 transition-colors focus:ring-2 focus:outline-none"

// Textarea
"bg-background border-border min-h-[100px] w-full resize-y rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"

// Select
"bg-background border-border w-full cursor-pointer appearance-none rounded-md border px-3 py-2 focus:ring-2"

// Label
"text-foreground mb-1.5 block text-sm font-medium"

// Error
input: "border-error focus:ring-error/50"
message: "mt-1 text-sm text-error"
```

## Cards

```tsx
// Basic
"bg-surface border-border rounded-lg border p-6"

// Interactive
"bg-surface border-border hover:border-primary/50 cursor-pointer rounded-lg border p-6 transition-all hover:shadow-md"
```

## Layout

```tsx
container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
flexRow: "flex items-center gap-4"
flexCol: "flex flex-col gap-4"
grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
```

## Feedback

```tsx
// Spinner
"border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"

// Skeleton
"bg-border h-4 w-full animate-pulse rounded"

// Badge
default: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface text-foreground border border-border"
success: "bg-success/10 text-success border-success/20"
error: "bg-error/10 text-error border-error/20"

// Alert
"bg-primary/10 border-primary/20 text-primary flex gap-3 rounded-lg border p-4"
```
