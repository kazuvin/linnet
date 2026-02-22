# コンポーネントテストパターン

## テストファイルの配置

```
src/components/ui/{name}/
├── {name}.tsx
├── {name}.test.tsx    ← 仕様書
├── {name}.stories.tsx
└── index.ts
```

## 仕様テンプレート

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ComponentName } from "./component-name";

/**
 * ComponentName 仕様
 *
 * 目的: [このコンポーネントが何をするか]
 * 用途: [主な使用ケース]
 */
describe("ComponentName", () => {
  // ===========================================
  // 初期状態
  // ===========================================
  describe("初期状態", () => {
    it("クラッシュせずにレンダリングされること", () => {
      render(<ComponentName />);
      expect(screen.getByRole("...")).toBeInTheDocument();
    });

    it("デフォルトのバリアントスタイルが適用されること", () => {
      render(<ComponentName data-testid="component" />);
      expect(screen.getByTestId("component")).toHaveClass("expected-class");
    });

    it("childrenが正しくレンダリングされること", () => {
      render(<ComponentName>テストコンテンツ</ComponentName>);
      expect(screen.getByText("テストコンテンツ")).toBeInTheDocument();
    });
  });

  // ===========================================
  // Props（API仕様）
  // ===========================================
  describe("Props", () => {
    describe("variant prop", () => {
      it("'primary'バリアントのスタイルが適用されること", () => {
        render(<ComponentName variant="primary" data-testid="component" />);
        expect(screen.getByTestId("component")).toHaveClass("bg-primary");
      });

      it("'secondary'バリアントのスタイルが適用されること", () => {
        render(<ComponentName variant="secondary" data-testid="component" />);
        expect(screen.getByTestId("component")).toHaveClass("bg-secondary");
      });
    });

    describe("size prop", () => {
      it.each([
        ["sm", "text-sm"],
        ["md", "text-base"],
        ["lg", "text-lg"],
      ])("'%s'サイズでクラス'%s'が適用されること", (size, expectedClass) => {
        render(<ComponentName size={size as "sm" | "md" | "lg"} data-testid="component" />);
        expect(screen.getByTestId("component")).toHaveClass(expectedClass);
      });
    });

    describe("disabled prop", () => {
      it("disabled=trueのとき無効化されること", () => {
        render(<ComponentName disabled />);
        expect(screen.getByRole("button")).toBeDisabled();
      });
    });
  });

  // ===========================================
  // ユーザー操作
  // ===========================================
  describe("ユーザー操作", () => {
    it("クリック時にonClickが呼ばれること", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<ComponentName onClick={handleClick}>クリック</ComponentName>);
      await user.click(screen.getByRole("button", { name: /クリック/i }));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("無効時はonClickが呼ばれないこと", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<ComponentName onClick={handleClick} disabled>クリック</ComponentName>);
      await user.click(screen.getByRole("button", { name: /クリック/i }));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("Enterキーを処理すること", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<ComponentName onClick={handleClick}>Enterを押す</ComponentName>);
      screen.getByRole("button").focus();
      await user.keyboard("{Enter}");

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================
  // アクセシビリティ
  // ===========================================
  describe("アクセシビリティ", () => {
    it("正しいARIA属性を持つこと", () => {
      render(<ComponentName aria-label="アクセシブルラベル" />);
      expect(screen.getByLabelText("アクセシブルラベル")).toBeInTheDocument();
    });

    it("フォーカス可能であること", () => {
      render(<ComponentName />);
      const element = screen.getByRole("button");
      element.focus();
      expect(element).toHaveFocus();
    });

    it("可視のフォーカスインジケーターを持つこと", () => {
      render(<ComponentName data-testid="component" />);
      const element = screen.getByTestId("component");
      element.focus();
      // フォーカス可視クラスを確認
      expect(element).toHaveClass("focus-visible:ring-2");
    });
  });

  // ===========================================
  // エッジケース
  // ===========================================
  describe("エッジケース", () => {
    it("空のchildrenを処理すること", () => {
      render(<ComponentName />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("非常に長いテキストを処理すること", () => {
      const longText = "A".repeat(1000);
      render(<ComponentName>{longText}</ComponentName>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it("カスタムclassNameがデフォルトとマージされること", () => {
      render(<ComponentName className="custom-class" data-testid="component" />);
      const element = screen.getByTestId("component");
      expect(element).toHaveClass("custom-class");
      // デフォルトクラスも持つこと
      expect(element).toHaveClass("rounded-md");
    });
  });

  // ===========================================
  // スタイリング
  // ===========================================
  describe("スタイリング", () => {
    it("カスタムclassNameが適用されること", () => {
      render(<ComponentName className="my-custom-class" data-testid="component" />);
      expect(screen.getByTestId("component")).toHaveClass("my-custom-class");
    });

    it("refが正しく転送されること", () => {
      const ref = { current: null };
      render(<ComponentName ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });
});
```

## テストパターン

### イベントハンドラー

```typescript
it("新しい値でonChangeが呼ばれること", async () => {
  const user = userEvent.setup();
  const handleChange = vi.fn();

  render(<Input onChange={handleChange} />);
  await user.type(screen.getByRole("textbox"), "hello");

  expect(handleChange).toHaveBeenLastCalledWith(
    expect.objectContaining({ target: expect.objectContaining({ value: "hello" }) })
  );
});
```

### 条件付きレンダリング

```typescript
it("バリデーション失敗時にエラーメッセージを表示すること", () => {
  render(<Input error="この項目は必須です" />);
  expect(screen.getByText("この項目は必須です")).toBeInTheDocument();
  expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
});

it("有効な場合はエラーを表示しないこと", () => {
  render(<Input />);
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
```

### ローディング状態

```typescript
it("ローディング中はスピナーを表示すること", () => {
  render(<Button loading>送信</Button>);
  expect(screen.getByRole("button")).toBeDisabled();
  expect(screen.getByTestId("spinner")).toBeInTheDocument();
});
```
