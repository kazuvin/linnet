# Async Patterns with Valtio

## Core Concept

Valtio の非同期パターンはシンプル: action 関数内で proxy を直接更新する。

```tsx
import { proxy, useSnapshot } from "valtio";

type User = { id: string; name: string };

const userState = proxy<{
  user: User | null;
  isLoading: boolean;
  error: string | null;
}>({
  user: null,
  isLoading: false,
  error: null,
});

export const useUserSnapshot = () => useSnapshot(userState);

export const fetchUser = async (userId: string) => {
  userState.isLoading = true;
  userState.error = null;
  try {
    const user = await fetch(`/api/users/${userId}`).then((r) => r.json());
    userState.user = user;
  } catch (e) {
    userState.error = e instanceof Error ? e.message : "Unknown error";
  } finally {
    userState.isLoading = false;
  }
};
```

## Pattern: Loading / Error / Data

```tsx
const state = proxy<{
  data: Product[];
  isLoading: boolean;
  error: string | null;
}>({
  data: [],
  isLoading: false,
  error: null,
});

export const useProductSnapshot = () => useSnapshot(state);

export const fetchProducts = async () => {
  state.isLoading = true;
  state.error = null;
  try {
    state.data = await fetch("/api/products").then((r) => r.json());
  } catch (e) {
    state.error = e instanceof Error ? e.message : "Unknown error";
  } finally {
    state.isLoading = false;
  }
};
```

## Pattern: Parameter-based Fetch

```tsx
const searchState = proxy<{
  keyword: string;
  results: Product[];
  isLoading: boolean;
}>({
  keyword: "",
  results: [],
  isLoading: false,
});

export const useSearchSnapshot = () => useSnapshot(searchState);

export const search = async (keyword: string) => {
  searchState.keyword = keyword;
  if (!keyword) {
    searchState.results = [];
    return;
  }
  searchState.isLoading = true;
  try {
    searchState.results = await searchProducts(keyword);
  } finally {
    searchState.isLoading = false;
  }
};
```

## Pattern: Cache Map

```tsx
const cacheState = proxy<{
  users: Record<string, User>;
  loadingIds: Set<string>;
}>({
  users: {},
  loadingIds: new Set(),
});

export const useCacheSnapshot = () => useSnapshot(cacheState);

export const fetchUserById = async (userId: string) => {
  if (cacheState.users[userId]) return; // already cached
  cacheState.loadingIds.add(userId);
  try {
    const user = await fetch(`/api/users/${userId}`).then((r) => r.json());
    cacheState.users[userId] = user;
  } finally {
    cacheState.loadingIds.delete(userId);
  }
};
```

## Key Insights

1. **ミュータブル更新**: `state.isLoading = true` のように直接更新
2. **自動再レンダリング**: useSnapshot で読み取ったプロパティが変わると再レンダリング
3. **コンポーネント外からも呼び出し可能**: action は普通の関数なので、どこからでも呼べる
4. **Suspense 不要**: loading/error 状態を明示的に管理（Suspense と組み合わせることも可能）
