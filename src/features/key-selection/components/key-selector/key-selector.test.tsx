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

    it("初期状態で C が選択されている", () => {
      render(<KeySelector />);

      const combobox = screen.getByRole("combobox");
      expect(combobox).toHaveTextContent("C");
    });
  });

  describe("インタラクション", () => {
    it("ルート音を選択するとストアが更新され UI に反映される", async () => {
      const user = userEvent.setup();
      render(<KeySelector />);

      const rootSelect = screen.getByRole("combobox");
      await user.click(rootSelect);
      await user.click(screen.getByRole("option", { name: "G" }));

      expect(screen.getByRole("combobox")).toHaveTextContent("G");
    });
  });
});
