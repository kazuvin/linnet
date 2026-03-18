"use client";

import type { GridChord } from "../../stores/chord-grid-store";

type GridGuideProps = {
  selectedCell: { row: number; col: number } | null;
  selectedChord: GridChord | null;
  hasChords: boolean;
};

export function GridGuide({ selectedCell, selectedChord, hasChords }: GridGuideProps) {
  if (selectedCell) {
    return (
      <p className="fade-in animate-in text-center text-muted text-sm duration-200">
        {selectedChord ? (
          <>
            コードを変更・削除できます · <span className="text-foreground/40">Esc</span> で選択解除
            · <span className="text-foreground/40">Delete</span> で削除
          </>
        ) : (
          <>
            セルをクリックしてコードを追加 · <span className="text-foreground/40">Esc</span>{" "}
            で選択解除
          </>
        )}
      </p>
    );
  }

  if (!hasChords) {
    return <p className="text-center text-muted text-sm">セルをクリックしてコードを追加</p>;
  }

  return null;
}
