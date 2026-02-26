# Zustand Basics

## Why Encapsulation?

snapshot hook と action のみを提供することで操作を制御:
1. フォーマット強制（生の store へのアクセス禁止）
2. 操作制限（増やせるが減らせない等）
3. 内部構造変更が外部に影響しない

```tsx
import { create } from "zustand";

type CountState = { count: number };

const useCountStore = create<CountState>()(() => ({ count: 0 }));  // private
export const useCountSnapshot = () => useCountStore();
export const increment = (step = 1) => {
  if (step < 0) throw new Error("負の数は不可");
  useCountStore.setState((state) => ({ count: state.count + step }));
};
```

## Core API

### create - ストアの作成

```tsx
import { create } from "zustand";

const useCountStore = create<{ count: number }>()(() => ({ count: 0 }));
const useUserStore = create<{ user: User | null }>()(() => ({ user: null }));
```

### useStore() - 状態の読み取り（React）

```tsx
// 全状態を購読（いずれかのプロパティ変更で再レンダリング）
const Counter: React.FC = () => {
  const { count } = useCountStore();
  return <p>{count}</p>;
};

// セレクタで特定プロパティのみ購読（最適化）
const Counter: React.FC = () => {
  const count = useCountStore((s) => s.count);
  return <p>{count}</p>;
};
```

### getState() - 状態の読み取り（コンポーネント外）

```tsx
const current = useCountStore.getState().count;
```

## Action Functions

setState で状態を更新。普通の関数として定義:

```tsx
export const increment = (step = 1) => {
  useCountStore.setState((state) => ({ count: state.count + step }));
};

export const reset = () => {
  useCountStore.setState({ count: 0 });
};
```

## Derived State (useMemo + selector)

```tsx
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

// Private
const useAuthStore = create<AuthState>()(() => ({
  user: null,
  token: null,
  isLoading: false,
}));

// Snapshot Hook
export function useAuthSnapshot() {
  return useAuthStore();
}

// Actions
export async function login(creds: { email: string; password: string }) {
  useAuthStore.setState({ isLoading: true });
  try {
    const { user, token } = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(creds),
    }).then((r) => r.json());
    useAuthStore.setState({ user, token });
  } finally {
    useAuthStore.setState({ isLoading: false });
  }
}

export function logout() {
  useAuthStore.setState({ user: null, token: null });
}
```

## subscribe - 状態変更の監視

```tsx
// 全状態変更を監視
useAuthStore.subscribe((state, prevState) => {
  if (state.user !== prevState.user) {
    console.log("User changed:", state.user);
  }
});

// セレクタで特定プロパティのみ監視
useAuthStore.subscribe(
  (state) => state.user,
  (user, prevUser) => {
    console.log("User changed:", user);
  },
  { equalityFn: Object.is }
);
```

## Array State Patterns

配列の状態はイミュータブルに更新:

```tsx
// 追加
useStore.setState((state) => ({
  items: [...state.items, newItem],
}));

// 削除
useStore.setState((state) => ({
  items: state.items.filter((item) => item.id !== id),
}));

// 更新
useStore.setState((state) => ({
  items: state.items.map((item) =>
    item.id === id ? { ...item, ...updates } : item
  ),
}));

// 並び替え
useStore.setState((state) => {
  const newItems = [...state.items];
  const [moved] = newItems.splice(fromIndex, 1);
  newItems.splice(toIndex, 0, moved);
  return { items: newItems };
});
```

## Testing Pattern

```tsx
// テスト用リセット関数を提供
export function _resetForTesting(): void {
  useStore.setState({ ...INITIAL_STATE });
}
```
