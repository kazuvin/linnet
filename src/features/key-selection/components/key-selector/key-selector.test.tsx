import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { _resetKeyStoreForTesting } from "../../stores/key-store";
import { KeySelector } from "./key-selector";

describe("KeySelector", () => {
  afterEach(() => {
    _resetKeyStoreForTesting();
  });

  describe("レンダリング", () => {
    it("ラベル「Key」が表示される", () => {
      render(<KeySelector />);

      expect(screen.getByText("Key")).toBeInTheDocument();
    });

    it("初期状態で C と Triad が選択されている", () => {
      render(<KeySelector />);

      const comboboxes = screen.getAllByRole("combobox");
      expect(comboboxes[0]).toHaveTextContent("C");
      expect(comboboxes[1]).toHaveTextContent("Triad");
    });
  });

  describe("インタラクション", () => {
    it("ルート音を選択するとストアが更新され UI に反映される", async () => {
      const user = userEvent.setup();
      render(<KeySelector />);

      const rootSelect = screen.getAllByRole("combobox")[0];
      await user.click(rootSelect);
      await user.click(screen.getByRole("option", { name: "G" }));

      expect(screen.getAllByRole("combobox")[0]).toHaveTextContent("G");
    });

    it("コードタイプを変更するとストアが更新され UI に反映される", async () => {
      const user = userEvent.setup();
      render(<KeySelector />);

      const chordTypeSelect = screen.getAllByRole("combobox")[1];
      await user.click(chordTypeSelect);
      await user.click(screen.getByRole("option", { name: "Seventh" }));

      expect(screen.getAllByRole("combobox")[1]).toHaveTextContent("Seventh");
    });
  });
});
