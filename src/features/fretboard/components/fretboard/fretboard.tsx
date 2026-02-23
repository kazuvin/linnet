"use client";

import { useSelectedProgressionChord } from "@/features/chord-progression/stores/chord-progression-store";
import { useAvailableScales } from "@/features/fretboard/hooks/use-available-scales";
import { useFretboardPositions } from "@/features/fretboard/hooks/use-fretboard-positions";
import { useFretboardSnapshot } from "@/features/fretboard/stores/fretboard-store";
import { FretboardControls } from "../fretboard-controls";
import { FretboardGrid } from "../fretboard-grid";
import { ScaleChecker } from "../scale-checker";

export function Fretboard() {
  const { maxFret } = useFretboardSnapshot();
  const { availableScales, activeScaleType } = useAvailableScales();
  const positions = useFretboardPositions(activeScaleType);
  const selectedChord = useSelectedProgressionChord();

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="font-bold text-lg">Fretboard</h2>
        <FretboardControls maxFret={maxFret} />
      </div>
      {selectedChord && (
        <ScaleChecker
          availableScales={availableScales}
          activeScaleType={activeScaleType}
          chordSymbol={selectedChord.symbol}
        />
      )}
      <FretboardGrid positions={positions} maxFret={maxFret} />
      {positions.length === 0 && (
        <p className="text-center text-muted text-sm">
          コードを選択すると構成音とスケールが表示されます
        </p>
      )}
    </section>
  );
}
