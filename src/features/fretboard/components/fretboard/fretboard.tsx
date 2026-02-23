"use client";

import { useMemo } from "react";
import { useSelectedChord } from "@/features/chord-progression/stores/chord-progression-store";
import { useFretboardPositions } from "@/features/fretboard/hooks/use-fretboard-positions";
import { useFretboardSnapshot } from "@/features/fretboard/stores/fretboard-store";
import { useKeySnapshot } from "@/features/key-selection/stores/key-store";
import { noteNameToPitchClass } from "@/lib/music-theory";
import { FretboardControls } from "../fretboard-controls";
import { FretboardGrid } from "../fretboard-grid";

export function Fretboard() {
  const positions = useFretboardPositions();
  const { displayMode, scaleType, maxFret } = useFretboardSnapshot();
  const selectedChord = useSelectedChord();
  const { rootName } = useKeySnapshot();

  const rootPitchClass = useMemo(() => {
    if (displayMode === "chord-tones") {
      return selectedChord?.root.pitchClass ?? null;
    }
    return noteNameToPitchClass(rootName);
  }, [displayMode, selectedChord, rootName]);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="font-bold text-lg">Fretboard</h2>
        <FretboardControls displayMode={displayMode} scaleType={scaleType} maxFret={maxFret} />
      </div>
      <FretboardGrid positions={positions} maxFret={maxFret} rootPitchClass={rootPitchClass} />
      {positions.length === 0 && displayMode === "chord-tones" && (
        <p className="text-center text-muted text-sm">コードを選択すると構成音が表示されます</p>
      )}
    </section>
  );
}
