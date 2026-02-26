---
name: zustand-patterns
description: Zustand state management patterns. Use when designing stores, reviewing Zustand code, implementing async data fetching, or asked about state management architecture. Enforces store encapsulation where internal store is private and only snapshot hooks/actions are exported.
---

# Zustand Patterns

**Core Rule**: store インスタンスは直接 export しない。snapshot hook と action のみを export。

```tsx
// ❌ BAD
export const useUserStore = create<{ user: User | null }>()(() => ({ user: null }));

// ✅ GOOD
const useUserStore = create<{ user: User | null }>()(() => ({ user: null }));  // private
export const useUserSnapshot = () => useUserStore();  // read-only hook
export const login = async (creds: Creds) => { ... };  // action
```

## Pattern Guide

| やりたいこと           | パターン               | 参照                     |
| ---------------------- | ---------------------- | ------------------------ |
| 状態を読み取りたい     | snapshot hook           | [basics](references/basics.md) |
| 状態を更新したい       | Action function (setState) | [basics](references/basics.md) |
| 非同期データ取得       | Async action           | [async](references/async.md) |
| 派生状態               | useMemo + selector     | [basics](references/basics.md) |
| コンポーネント外で読取 | getState()             | [basics](references/basics.md) |

## Naming

| Type              | Pattern                | Example                  |
| ----------------- | ---------------------- | ------------------------ |
| Private store     | `useXxxStore` (private)| `useUserStore`           |
| Snapshot hook     | `useXxxSnapshot`       | `useUserSnapshot`        |
| Action            | verb (plain function)  | `login`, `increment`     |
| Store file        | `xxx-store.ts`         | `auth-store.ts`          |

## File Structure

```tsx
// src/features/xxx/stores/xxx-store.ts
import { create } from "zustand";

type UserState = { user: User | null };

// Private (NEVER export)
const useUserStore = create<UserState>()(() => ({ user: null }));

// Snapshot Hook Exports
export function useUserSnapshot() {
  return useUserStore();
}

// Action Exports
export async function login(creds: Creds) {
  const { user } = await fetchLogin(creds);
  useUserStore.setState({ user });
}

// Sync read outside React
export function getUser() {
  return useUserStore.getState().user;
}
```
