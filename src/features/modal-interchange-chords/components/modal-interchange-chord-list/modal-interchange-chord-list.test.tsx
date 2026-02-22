import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { _resetKeyStoreForTesting, setRootName } from "@/features/key-selection/stores/key-store";
import { ModalInterchangeChordList } from "./modal-interchange-chord-list";

describe("ModalInterchangeChordList", () => {
  afterEach(() => {
    _resetKeyStoreForTesting();
  });

  describe("レンダリング", () => {
    it("セクション見出しが表示される", () => {
      render(<ModalInterchangeChordList />);
      expect(screen.getByRole("heading", { name: "Modal Interchange" })).toBeInTheDocument();
    });

    it("7つのモードセクションが表示される", () => {
      render(<ModalInterchangeChordList />);
      const modeNames = [
        "Natural Minor",
        "Harmonic Minor",
        "Melodic Minor",
        "Dorian",
        "Phrygian",
        "Lydian",
        "Mixolydian",
      ];
      for (const name of modeNames) {
        expect(screen.getByRole("heading", { name })).toBeInTheDocument();
      }
    });
  });

  describe("キー変更への反応", () => {
    it("キーが G に変更されるとコードが更新される", async () => {
      render(<ModalInterchangeChordList />);

      // C のときは Eb が表示される（Natural Minor 由来）
      expect(screen.getAllByText("Eb").length).toBeGreaterThan(0);

      await act(async () => {
        setRootName("G");
      });

      // G のときは Bb が表示される（Natural Minor 由来）
      expect(screen.getAllByText("Bb").length).toBeGreaterThan(0);
    });
  });
});
