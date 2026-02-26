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

### Selector（推奨 - 必要なプロパティのみ購読）

```tsx
const Counter: React.FC = () => {
  const count = useCountStore((s) => s.count);
  return <p>{count}</p>;  // count が変わった時だけ再レンダリング
};
```

### Destructuring（小さいストアに適用）

```tsx
const Counter: React.FC = () => {
  const { count, increment } = useCountStore();
  return <button onClick={() => increment()}>{count}</button>;
};
```

## Reading State (Outside React)

```tsx
const current = useCountStore.getState().count;
useCountStore.getState().increment();
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
