"use client";

import { useFretboardPositions } from "@/features/fretboard/hooks/use-fretboard-positions";
import { useFretboardSnapshot } from "@/features/fretboard/stores/fretboard-store";
import { FretboardControls } from "../fretboard-controls";
import { FretboardGrid } from "../fretboard-grid";

export function Fretboard() {
  const positions = useFretboardPositions();
  const { maxFret } = useFretboardSnapshot();

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="font-bold text-lg">Fretboard</h2>
        <FretboardControls maxFret={maxFret} />
      </div>
      <FretboardGrid positions={positions} maxFret={maxFret} />
      {positions.length === 0 && (
        <p className="text-center text-muted text-sm">
          コードを選択すると構成音とスケールが表示されます
        </p>
      )}
    </section>
  );
}
