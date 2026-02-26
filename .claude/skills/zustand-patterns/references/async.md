# Async Patterns with Zustand

## Core Concept

Zustand の非同期パターンはシンプル: store 内の action 関数で set を呼び出す。

```tsx
import { create } from "zustand";

type User = { id: string; name: string };

type UserState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
};

type UserActions = {
  fetchUser: (userId: string) => Promise<void>;
};

export const useUserStore = create<UserState & UserActions>()((set) => ({
  user: null,
  isLoading: false,
  error: null,

  fetchUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const user = await fetch(`/api/users/${userId}`).then((r) => r.json());
      set({ user });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Unknown error" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
```

## Pattern: Loading / Error / Data

```tsx
type ProductState = {
  data: Product[];
  isLoading: boolean;
  error: string | null;
};

type ProductActions = {
  fetchProducts: () => Promise<void>;
};

export const useProductStore = create<ProductState & ProductActions>()((set) => ({
  data: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetch("/api/products").then((r) => r.json());
      set({ data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Unknown error" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
```

## Pattern: Parameter-based Fetch

```tsx
type SearchState = {
  keyword: string;
  results: Product[];
  isLoading: boolean;
};

type SearchActions = {
  search: (keyword: string) => Promise<void>;
};

export const useSearchStore = create<SearchState & SearchActions>()((set) => ({
  keyword: "",
  results: [],
  isLoading: false,

  search: async (keyword) => {
    set({ keyword });
    if (!keyword) {
      set({ results: [] });
      return;
    }
    set({ isLoading: true });
    try {
      const results = await searchProducts(keyword);
      set({ results });
    } finally {
      set({ isLoading: false });
    }
  },
}));
```

## Pattern: Cache Map with get()

```tsx
type CacheState = {
  users: Record<string, User>;
  loadingIds: string[];
};

type CacheActions = {
  fetchUserById: (userId: string) => Promise<void>;
};

export const useCacheStore = create<CacheState & CacheActions>()((set, get) => ({
  users: {},
  loadingIds: [],

  fetchUserById: async (userId) => {
    if (get().users[userId]) return; // already cached
    set((s) => ({ loadingIds: [...s.loadingIds, userId] }));
    try {
      const user = await fetch(`/api/users/${userId}`).then((r) => r.json());
      set((s) => ({ users: { ...s.users, [userId]: user } }));
    } finally {
      set((s) => ({ loadingIds: s.loadingIds.filter((id) => id !== userId) }));
    }
  },
}));
```

## Key Insights

1. **イミュータブル更新**: `set({ ... })` または `set((state) => ({ ... }))` で更新
2. **自動再レンダリング**: useStore(selector) で読み取った状態が変わると再レンダリング
3. **get() でストア内から現在の状態を読み取り**: キャッシュチェック等に使用
4. **コンポーネント外からも呼び出し可能**: `useStore.getState().action()` でどこからでも呼べる
5. **Suspense 不要**: loading/error 状態を明示的に管理
