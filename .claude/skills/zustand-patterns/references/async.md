# Async Patterns with Zustand

## Core Concept

Zustand の非同期パターンはシンプル: action 関数内で setState を呼び出す。

```tsx
import { create } from "zustand";

type User = { id: string; name: string };

type UserState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
};

const useUserStore = create<UserState>()(() => ({
  user: null,
  isLoading: false,
  error: null,
}));

export function useUserSnapshot() {
  return useUserStore();
}

export async function fetchUser(userId: string) {
  useUserStore.setState({ isLoading: true, error: null });
  try {
    const user = await fetch(`/api/users/${userId}`).then((r) => r.json());
    useUserStore.setState({ user });
  } catch (e) {
    useUserStore.setState({ error: e instanceof Error ? e.message : "Unknown error" });
  } finally {
    useUserStore.setState({ isLoading: false });
  }
}
```

## Pattern: Loading / Error / Data

```tsx
type ProductState = {
  data: Product[];
  isLoading: boolean;
  error: string | null;
};

const useProductStore = create<ProductState>()(() => ({
  data: [],
  isLoading: false,
  error: null,
}));

export function useProductSnapshot() {
  return useProductStore();
}

export async function fetchProducts() {
  useProductStore.setState({ isLoading: true, error: null });
  try {
    const data = await fetch("/api/products").then((r) => r.json());
    useProductStore.setState({ data });
  } catch (e) {
    useProductStore.setState({ error: e instanceof Error ? e.message : "Unknown error" });
  } finally {
    useProductStore.setState({ isLoading: false });
  }
}
```

## Pattern: Parameter-based Fetch

```tsx
type SearchState = {
  keyword: string;
  results: Product[];
  isLoading: boolean;
};

const useSearchStore = create<SearchState>()(() => ({
  keyword: "",
  results: [],
  isLoading: false,
}));

export function useSearchSnapshot() {
  return useSearchStore();
}

export async function search(keyword: string) {
  useSearchStore.setState({ keyword });
  if (!keyword) {
    useSearchStore.setState({ results: [] });
    return;
  }
  useSearchStore.setState({ isLoading: true });
  try {
    const results = await searchProducts(keyword);
    useSearchStore.setState({ results });
  } finally {
    useSearchStore.setState({ isLoading: false });
  }
}
```

## Pattern: Cache Map

```tsx
type CacheState = {
  users: Record<string, User>;
  loadingIds: string[];
};

const useCacheStore = create<CacheState>()(() => ({
  users: {},
  loadingIds: [],
}));

export function useCacheSnapshot() {
  return useCacheStore();
}

export async function fetchUserById(userId: string) {
  const { users } = useCacheStore.getState();
  if (users[userId]) return; // already cached
  useCacheStore.setState((state) => ({
    loadingIds: [...state.loadingIds, userId],
  }));
  try {
    const user = await fetch(`/api/users/${userId}`).then((r) => r.json());
    useCacheStore.setState((state) => ({
      users: { ...state.users, [userId]: user },
    }));
  } finally {
    useCacheStore.setState((state) => ({
      loadingIds: state.loadingIds.filter((id) => id !== userId),
    }));
  }
}
```

## Key Insights

1. **イミュータブル更新**: `setState({ ... })` または `setState((state) => ({ ... }))` で更新
2. **自動再レンダリング**: useStore で読み取った状態が変わると再レンダリング
3. **コンポーネント外からも呼び出し可能**: action は普通の関数なので、どこからでも呼べる
4. **getState() で同期読み取り**: コンポーネント外での状態読み取りに使用
5. **Suspense 不要**: loading/error 状態を明示的に管理
