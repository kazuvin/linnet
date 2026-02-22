import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RootNoteSelector } from "./root-note-selector";

describe("RootNoteSelector", () => {
  describe("レンダリング", () => {
    it("combobox トリガーが表示される", () => {
      render(<RootNoteSelector value="C" onValueChange={vi.fn()} />);

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("選択中のルート音がトリガーに表示される", () => {
      render(<RootNoteSelector value="C" onValueChange={vi.fn()} />);

      expect(screen.getByRole("combobox")).toHaveTextContent("C");
    });

    it("シャープ付きの音名が表示される", () => {
      render(<RootNoteSelector value="F#" onValueChange={vi.fn()} />);

      expect(screen.getByRole("combobox")).toHaveTextContent("F#/Gb");
    });

    it("フラット値（'Db'）で value を渡しても正しく表示される", () => {
      render(<RootNoteSelector value="Db" onValueChange={vi.fn()} />);

      expect(screen.getByRole("combobox")).toHaveTextContent("C#/Db");
    });
  });

  describe("インタラクション", () => {
    it("クリックで12個のオプションが表示される", async () => {
      const user = userEvent.setup();
      render(<RootNoteSelector value="C" onValueChange={vi.fn()} />);

      await user.click(screen.getByRole("combobox"));

      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(12);
    });

    it("オプションを選択すると onValueChange がシャープ名で呼ばれる", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<RootNoteSelector value="C" onValueChange={onValueChange} />);

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: "D" }));

      expect(onValueChange).toHaveBeenCalledWith("D");
    });
  });
});
