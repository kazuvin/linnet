import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./select";

const OPTIONS = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

describe("Select", () => {
  describe("レンダリング", () => {
    it("トリガーボタンが表示される", () => {
      render(<Select value="apple" onValueChange={() => {}} options={OPTIONS} />);

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("選択中の値のラベルがトリガーに表示される", () => {
      render(<Select value="banana" onValueChange={() => {}} options={OPTIONS} />);

      expect(screen.getByRole("combobox")).toHaveTextContent("Banana");
    });

    it("placeholder が表示される（値未選択時）", () => {
      render(
        <Select
          value=""
          onValueChange={() => {}}
          options={OPTIONS}
          placeholder="選択してください"
        />
      );

      expect(screen.getByRole("combobox")).toHaveTextContent("選択してください");
    });
  });

  describe("インタラクション", () => {
    it("クリックでオプション一覧が表示される", async () => {
      const user = userEvent.setup();
      render(<Select value="apple" onValueChange={() => {}} options={OPTIONS} />);

      await user.click(screen.getByRole("combobox"));

      expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Cherry" })).toBeInTheDocument();
    });

    it("オプションを選択すると onValueChange が呼ばれる", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Select value="apple" onValueChange={onValueChange} options={OPTIONS} />);

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: "Cherry" }));

      expect(onValueChange).toHaveBeenCalledWith("cherry");
    });
  });
});
