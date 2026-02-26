# Container Components (Features + Zustand)

Store design: see **zustand-patterns** skill.

## Directory Structure

```
src/features/{feature}/
├── components/     # Feature UI
├── stores/         # Zustand stores
├── hooks/          # Custom hooks (optional)
├── types/          # Types
└── index.ts        # Public API
```

## Template

```tsx
"use client";
import { useAuthSnapshot, login } from "../stores/auth-store";
import { LoginFormPresentation } from "@/components/auth/login-form";

export function LoginFormContainer() {
  const { isLoading, error } = useAuthSnapshot();

  return (
    <LoginFormPresentation
      isLoading={isLoading}
      error={error}
      onSubmit={(email, password) => login({ email, password })}
    />
  );
}
```

## Public API

```tsx
// features/auth/index.ts
export { LoginFormContainer } from "./components/login-form";
export { useAuth } from "./hooks/use-auth";
export { useAuthSnapshot, login, logout } from "./stores/auth-store";
export type { User, LoginCredentials } from "./types";
```

## Key Principles

1. Colocation: components, stores, hooks, types in feature folder
2. Container/Presentation split
3. Export only what others need
4. `"use client"` required for Zustand hooks
5. Store encapsulation: follow **zustand-patterns**
