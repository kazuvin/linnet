# Zustand Basics

## Store Definition

actions と state を同じ store に定義:

```tsx
import { create } from "zustand";

type CountState = { count: number };
type CountActions = {
  increment: (step?: number) => void;
  reset: () => void;
};

export const useCountStore = create<CountState & CountActions>()((set) => ({
  count: 0,
  increment: (step = 1) => set((state) => ({ count: state.count + step })),
  reset: () => set({ count: 0 }),
}));
```

## Reading State (React)

### Selector（必須 - 必要なプロパティのみ購読）

```tsx
const Counter: React.FC = () => {
  const count = useCountStore((s) => s.count);
  const increment = useCountStore((s) => s.increment);
  return <button onClick={() => increment()}>{count}</button>;
  // count が変わった時だけ再レンダリング（increment は安定参照）
};
```

> **⚠ 分割代入 `const { count } = useStore()` は禁止**
> セレクタなしで呼び出すと store 全体を購読し、無関係な state 変更でも再レンダリングが発生する。
> 必ず個別セレクタ `useStore((s) => s.xxx)` を使用すること。

## Reading State (Outside React)

```tsx
const current = useCountStore.getState().count;
useCountStore.getState().increment();
```

## Derived State (xxx-selectors.ts に分離)

派生状態は store ファイルとは別の selectors ファイルに定義する:

```tsx
// user-selectors.ts
import { useMemo } from "react";
import { useUserStore } from "./user-store";

export function useFullName() {
  const firstName = useUserStore((s) => s.firstName);
  const lastName = useUserStore((s) => s.lastName);
  return useMemo(() => `${firstName} ${lastName}`, [firstName, lastName]);
}
```

## Auth Module Example

```tsx
import { create } from "zustand";

type User = { id: string; name: string };

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
};

type AuthActions = {
  login: (creds: { email: string; password: string }) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  user: null,
  token: null,
  isLoading: false,

  login: async (creds) => {
    set({ isLoading: true });
    try {
      const { user, token } = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(creds),
      }).then((r) => r.json());
      set({ user, token });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => set({ user: null, token: null }),
}));
```

## subscribe - 状態変更の監視

```tsx
useAuthStore.subscribe((state, prevState) => {
  if (state.user !== prevState.user) {
    console.log("User changed:", state.user);
  }
});
```

## Array State Patterns

配列の状態はイミュータブルに更新:

```tsx
export const useItemStore = create<ItemState & ItemActions>()((set) => ({
  items: [],
  // 追加
  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
  // 削除
  removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  // 更新
  updateItem: (id, updates) =>
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    })),
  // 並び替え
  reorder: (from, to) =>
    set((s) => {
      const newItems = [...s.items];
      const [moved] = newItems.splice(from, 1);
      newItems.splice(to, 0, moved);
      return { items: newItems };
    }),
}));
```

## Testing Pattern

```tsx
// テスト用リセット関数を提供
export function _resetForTesting(): void {
  useStore.setState({ ...INITIAL_STATE });
}

// テスト内でのアクション呼び出し
await act(async () => {
  useStore.getState().someAction();
});
```
