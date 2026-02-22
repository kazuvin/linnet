# Valtio Basics: Proxy-based Reactivity

## Why Encapsulation?

snapshot hook と action のみを提供することで操作を制御:
1. フォーマット強制（生の proxy へのアクセス禁止）
2. 操作制限（増やせるが減らせない等）
3. 内部構造変更が外部に影響しない

```tsx
import { proxy, useSnapshot } from "valtio";

const countState = proxy({ count: 0 });  // private
export const useCountSnapshot = () => useSnapshot(countState);
export const increment = (step = 1) => {
  if (step < 0) throw new Error("負の数は不可");
  countState.count += step;
};
```

## Core API

### proxy - 状態の作成

```tsx
import { proxy } from "valtio";

const countState = proxy({ count: 0 });
const userState = proxy<{ user: User | null }>({ user: null });
```

### useSnapshot - 状態の読み取り（React）

```tsx
import { useSnapshot } from "valtio";

const Counter: React.FC = () => {
  const snap = useSnapshot(countState);
  return <p>{snap.count}</p>;  // countが変わった時だけ再レンダリング
};
```

### snapshot - 状態の読み取り（コンポーネント外）

```tsx
import { snapshot } from "valtio";

const current = snapshot(countState).count;
```

## Action Functions

proxy を直接ミュータブルに更新。普通の関数として定義:

```tsx
export const increment = (step = 1) => {
  countState.count += step;
};

export const reset = () => {
  countState.count = 0;
};
```

## Derived State (getter)

```tsx
const state = proxy({
  firstName: "John",
  lastName: "Doe",
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  },
});
```

## Auth Module Example

```tsx
import { proxy, useSnapshot } from "valtio";

type User = { id: string; name: string };

// Private
const authState = proxy<{
  user: User | null;
  token: string | null;
  isLoading: boolean;
}>({
  user: null,
  token: null,
  isLoading: false,
});

// Snapshot Hook
export const useAuthSnapshot = () => useSnapshot(authState);

// Actions
export const login = async (creds: { email: string; password: string }) => {
  authState.isLoading = true;
  try {
    const { user, token } = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(creds),
    }).then((r) => r.json());
    authState.user = user;
    authState.token = token;
  } finally {
    authState.isLoading = false;
  }
};

export const logout = () => {
  authState.user = null;
  authState.token = null;
};
```

## subscribeKey - 特定プロパティの監視

```tsx
import { subscribeKey } from "valtio/utils";

subscribeKey(authState, "user", (user) => {
  console.log("User changed:", user);
});
```
