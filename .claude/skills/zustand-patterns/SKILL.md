---
name: zustand-patterns
description: Zustand state management patterns following official conventions. Use when designing stores, reviewing Zustand code, implementing async data fetching, or asked about state management architecture. Store is exported directly with actions colocated inside create().
---

# Zustand Patterns

**Core Rule**: actions は store 内に定義し、store hook を直接 export する。派生状態は selectors ファイルに分離する。コンポーネントでは**必ず個別セレクタ**で必要な値のみ購読する。

```tsx
// ✅ GOOD - 個別セレクタで必要な値のみ購読
const user = useUserStore((s) => s.user);
const login = useUserStore((s) => s.login);

// ❌ BAD - 分割代入は store 全体を購読し不要な再レンダリングが発生
const { user, login } = useUserStore();
```

## Pattern Guide

| やりたいこと           | パターン               | 参照                     |
| ---------------------- | ---------------------- | ------------------------ |
| 状態を読み取りたい     | useStore(selector)     | [basics](references/basics.md) |
| 状態を更新したい       | store 内 action (set)  | [basics](references/basics.md) |
| 非同期データ取得       | store 内 async action  | [async](references/async.md) |
| 派生状態               | selectors ファイル     | [basics](references/basics.md) |
| コンポーネント外で読取 | useStore.getState()    | [basics](references/basics.md) |

## Naming

| Type              | Pattern                | Example                  |
| ----------------- | ---------------------- | ------------------------ |
| Store hook        | `useXxxStore`          | `useUserStore`           |
| Derived hook      | `useXxx`               | `useDiatonicChords`      |
| Store file        | `xxx-store.ts`         | `auth-store.ts`          |
| Selectors file    | `xxx-selectors.ts`     | `key-selectors.ts`       |

## File Structure

```
src/features/xxx/stores/
  xxx-store.ts         # state + actions のみ
  xxx-selectors.ts     # 派生状態 (useMemo + selector)
  xxx-store.test.ts    # store + selectors のテスト
```

### Store file (xxx-store.ts)

```tsx
import { create } from "zustand";

type UserState = { user: User | null };
type UserActions = {
  login: (creds: Creds) => Promise<void>;
  logout: () => void;
};

export const useUserStore = create<UserState & UserActions>()((set) => ({
  user: null,
  login: async (creds) => {
    const { user } = await fetchLogin(creds);
    set({ user });
  },
  logout: () => set({ user: null }),
}));

// Testing helper
export function _resetUserStoreForTesting() {
  useUserStore.setState({ user: null });
}
```

### Selectors file (xxx-selectors.ts)

```tsx
import { useMemo } from "react";
import { useUserStore } from "./user-store";

export function useUserDisplayName() {
  const user = useUserStore((s) => s.user);
  return useMemo(() => user?.name ?? "Guest", [user]);
}

export function useIsLoggedIn() {
  const user = useUserStore((s) => s.user);
  return user !== null;
}
```

## Cross-store Coordination

```tsx
// src/features/store-coordination.ts
import { useStoreA } from "./a/stores/a-store";
import { useStoreB } from "./b/stores/b-store";

export function compositeAction() {
  useStoreA.getState().actionA();
  useStoreB.getState().actionB();
}
```
