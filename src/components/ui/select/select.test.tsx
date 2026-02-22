import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

describe("Select", () => {
  function renderSelect({ value = "apple", onValueChange = vi.fn(), placeholder = "選択" } = {}) {
    return render(
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="cherry">Cherry</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  describe("レンダリング", () => {
    it("トリガーボタンが表示される", () => {
      renderSelect();

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("選択中の値のラベルがトリガーに表示される", () => {
      renderSelect({ value: "banana" });

      expect(screen.getByRole("combobox")).toHaveTextContent("Banana");
    });

    it("placeholder が表示される（値未選択時）", () => {
      renderSelect({ value: "", placeholder: "選択してください" });

      expect(screen.getByRole("combobox")).toHaveTextContent("選択してください");
    });
  });

  describe("インタラクション", () => {
    it("クリックでオプション一覧が表示される", async () => {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByRole("combobox"));

      expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Cherry" })).toBeInTheDocument();
    });

    it("オプションを選択すると onValueChange が呼ばれる", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      renderSelect({ onValueChange });

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: "Cherry" }));

      expect(onValueChange).toHaveBeenCalledWith("cherry");
    });
  });
});
