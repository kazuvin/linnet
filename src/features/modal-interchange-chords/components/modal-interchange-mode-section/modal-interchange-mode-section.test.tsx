import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ModalInterchangeModeGroup } from "@/features/key-selection/stores/key-store";
import { getModalInterchangeChords } from "@/lib/music-theory";
import { ModalInterchangeModeSection } from "./modal-interchange-mode-section";

function createTestModeGroup(
  overrides: Partial<ModalInterchangeModeGroup> = {}
): ModalInterchangeModeGroup {
  return {
    source: "natural-minor",
    displayName: "Natural Minor",
    chords: getModalInterchangeChords("C", "natural-minor"),
    ...overrides,
  };
}

describe("ModalInterchangeModeSection", () => {
  describe("レンダリング", () => {
    it("モード名の見出しが表示される", () => {
      render(<ModalInterchangeModeSection modeGroup={createTestModeGroup()} />);
      expect(screen.getByRole("heading", { name: "Natural Minor" })).toBeInTheDocument();
    });

    it("7つのコードカードが表示される", () => {
      render(<ModalInterchangeModeSection modeGroup={createTestModeGroup()} />);
      const items = screen.getAllByRole("listitem");
      expect(items).toHaveLength(7);
    });

    it("ドリアンモードの見出しが正しく表示される", () => {
      render(
        <ModalInterchangeModeSection
          modeGroup={createTestModeGroup({
            source: "dorian",
            displayName: "Dorian",
            chords: getModalInterchangeChords("C", "dorian"),
          })}
        />
      );
      expect(screen.getByRole("heading", { name: "Dorian" })).toBeInTheDocument();
    });
  });

  describe("レイアウト", () => {
    it("リストが横スクロール可能である", () => {
      render(<ModalInterchangeModeSection modeGroup={createTestModeGroup()} />);
      const list = screen.getByRole("list");
      expect(list.className).toContain("overflow-x-auto");
    });
  });
});
