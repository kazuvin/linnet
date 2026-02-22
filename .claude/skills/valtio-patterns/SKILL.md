---
name: valtio-patterns
description: Valtio state management patterns with proxy-based reactivity. Use when designing stores, reviewing Valtio code, implementing async data fetching, or asked about state management architecture. Enforces store encapsulation where internal proxy state is private and only snapshot hooks/actions are exported.
---

# Valtio Patterns

**Core Rule**: proxy stateは直接exportしない。snapshot hookとactionのみをexport。

```tsx
// ❌ BAD
export const userState = proxy<{ user: User | null }>({ user: null });

// ✅ GOOD
const userState = proxy<{ user: User | null }>({ user: null });  // private
export const useUserSnapshot = () => useSnapshot(userState);  // read-only hook
export const login = async (creds: Creds) => { ... };  // action
```

## Pattern Guide

| やりたいこと           | パターン               | 参照                     |
| ---------------------- | ---------------------- | ------------------------ |
| 状態を読み取りたい     | useSnapshot hook       | [basics](references/basics.md) |
| 状態を更新したい       | Action function        | [basics](references/basics.md) |
| 非同期データ取得       | Async action           | [async](references/async.md) |
| 派生状態               | getter / derive        | [basics](references/basics.md) |
| キャッシュマップ       | Record in proxy        | [async](references/async.md) |

## Naming

| Type              | Pattern                | Example                  |
| ----------------- | ---------------------- | ------------------------ |
| Private proxy     | `xxxState` (private)   | `userState`              |
| Snapshot hook     | `useXxxSnapshot`       | `useUserSnapshot`        |
| Action            | verb (plain function)  | `login`, `increment`     |
| Store file        | `xxx-store.ts`         | `auth-store.ts`          |

## File Structure

```tsx
// src/features/xxx/stores/xxx-store.ts
import { proxy, useSnapshot } from "valtio";

// Private (NEVER export)
const userState = proxy<{ user: User | null }>({ user: null });

// Snapshot Hook Exports
export const useUserSnapshot = () => useSnapshot(userState);

// Action Exports
export const login = async (creds: Creds) => {
  const { user } = await fetchLogin(creds);
  userState.user = user;
};
```
