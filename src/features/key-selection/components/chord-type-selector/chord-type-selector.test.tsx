import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChordTypeSelector } from "./chord-type-selector";

describe("ChordTypeSelector", () => {
  describe("レンダリング", () => {
    it("combobox トリガーが表示される", () => {
      render(<ChordTypeSelector value="triad" onValueChange={vi.fn()} />);

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("選択中の値がトリガーに表示される", () => {
      render(<ChordTypeSelector value="seventh" onValueChange={vi.fn()} />);

      expect(screen.getByRole("combobox")).toHaveTextContent("Seventh");
    });
  });

  describe("インタラクション", () => {
    it("クリックで 2 つのオプションが表示される", async () => {
      const user = userEvent.setup();
      render(<ChordTypeSelector value="triad" onValueChange={vi.fn()} />);

      await user.click(screen.getByRole("combobox"));

      expect(screen.getByRole("option", { name: "Triad" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Seventh" })).toBeInTheDocument();
    });

    it("クリックで onValueChange が正しい値で呼ばれる", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<ChordTypeSelector value="triad" onValueChange={onValueChange} />);

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: "Seventh" }));

      expect(onValueChange).toHaveBeenCalledWith("seventh");
    });
  });
});
