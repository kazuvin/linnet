"use client";

import { useMemo } from "react";
import { useSelectedChord } from "@/features/chord-progression/stores/chord-progression-store";
import { useChordVoicings } from "@/features/fretboard/hooks/use-chord-voicings";
import { useFretboardPositions } from "@/features/fretboard/hooks/use-fretboard-positions";
import { useFretboardSnapshot } from "@/features/fretboard/stores/fretboard-store";
import { useKeySnapshot } from "@/features/key-selection/stores/key-store";
import { noteNameToPitchClass } from "@/lib/music-theory";
import { FretboardControls } from "../fretboard-controls";
import { FretboardGrid } from "../fretboard-grid";

const ALL_STRINGS = new Set([1, 2, 3, 4, 5, 6]);

export function Fretboard() {
  const positions = useFretboardPositions();
  const { displayMode, scaleType, maxFret, selectedVoicingIndex } = useFretboardSnapshot();
  const selectedChord = useSelectedChord();
  const { rootName } = useKeySnapshot();
  const voicings = useChordVoicings();

  const rootPitchClass = useMemo(() => {
    if (displayMode === "chord-tones" || displayMode === "voicing") {
      return selectedChord?.root.pitchClass ?? null;
    }
    return noteNameToPitchClass(rootName);
  }, [displayMode, selectedChord, rootName]);

  const currentVoicing = useMemo(() => {
    if (displayMode !== "voicing" || voicings.length === 0) return null;
    const index = Math.min(selectedVoicingIndex, voicings.length - 1);
    return voicings[index];
  }, [displayMode, voicings, selectedVoicingIndex]);

  const barreInfo = currentVoicing?.barreInfo;

  const mutedStrings = useMemo(() => {
    if (!currentVoicing) return undefined;
    const usedStrings = new Set(currentVoicing.positions.map((p) => p.string));
    const muted = new Set<number>();
    for (const s of ALL_STRINGS) {
      if (!usedStrings.has(s)) muted.add(s);
    }
    return muted.size > 0 ? muted : undefined;
  }, [currentVoicing]);

  const voicingLabel = useMemo(() => {
    if (!currentVoicing) return null;
    if (currentVoicing.barreInfo) return "バレーコード";
    return "オープンコード";
  }, [currentVoicing]);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="font-bold text-lg">Fretboard</h2>
        <FretboardControls displayMode={displayMode} scaleType={scaleType} maxFret={maxFret} />
      </div>
      {displayMode === "voicing" && voicingLabel && (
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary-subtle px-3 py-0.5 font-mono text-primary text-sm">
            {voicingLabel}
          </span>
          {selectedChord && (
            <span className="font-mono text-muted text-sm">{selectedChord.symbol}</span>
          )}
        </div>
      )}
      <FretboardGrid
        positions={positions}
        maxFret={maxFret}
        rootPitchClass={rootPitchClass}
        barreInfo={barreInfo}
        mutedStrings={mutedStrings}
      />
      {positions.length === 0 && displayMode === "chord-tones" && (
        <p className="text-center text-muted text-sm">コードを選択すると構成音が表示されます</p>
      )}
      {positions.length === 0 && displayMode === "voicing" && (
        <p className="text-center text-muted text-sm">
          {selectedChord
            ? "このコードのボイシングデータはまだ登録されていません"
            : "コードを選択するとボイシングが表示されます"}
        </p>
      )}
    </section>
  );
}
