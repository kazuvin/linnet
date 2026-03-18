"use client";

import { TabNav, TabNavItem } from "@/components/ui/tab-nav";
import { useSelectedProgressionChord } from "@/features/chord-progression/stores/chord-progression-selectors";
import { useAvailableScales } from "@/features/fretboard/hooks/use-available-scales";
import { useFretboardPositions } from "@/features/fretboard/hooks/use-fretboard-positions";
import type { InstrumentTab } from "@/features/fretboard/stores/fretboard-store";
import { MAX_FRET, useFretboardStore } from "@/features/fretboard/stores/fretboard-store";
import { PianoKeyboard } from "@/features/keyboard/components";
import { SCALE_DISPLAY_NAMES } from "@/lib/music-theory";
import { FretboardGrid } from "../fretboard-grid";
import { FretboardLegend } from "../fretboard-legend";
import { ScalePlayButton } from "../scale-checker/scale-play-button";

export function Fretboard() {
  const { showCharacteristicNotes, showAvoidNotes, activeInstrument, setActiveInstrument } =
    useFretboardStore();
  const { activeScaleType, scaleRoot } = useAvailableScales();
  const positions = useFretboardPositions(activeScaleType);
  const selectedChord = useSelectedProgressionChord();

  const scaleDisplayName = activeScaleType ? SCALE_DISPLAY_NAMES[activeScaleType] : null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <TabNav
          value={activeInstrument}
          onValueChange={(v) => setActiveInstrument(v as InstrumentTab)}
        >
          <TabNavItem value="fretboard">フレットボード</TabNavItem>
          <TabNavItem value="keyboard">鍵盤</TabNavItem>
        </TabNav>
        {/* スケール表示（読み取り専用） */}
        {selectedChord && activeScaleType && scaleRoot && (
          <div className="flex items-center gap-2">
            <span className="text-muted text-sm">
              <span className="font-bold text-foreground">{selectedChord.symbol}</span>{" "}
              <span className="text-foreground/70">
                {scaleRoot} {scaleDisplayName}
              </span>
            </span>
            <ScalePlayButton scaleType={activeScaleType} scaleRoot={scaleRoot} />
          </div>
        )}
      </div>
      {activeInstrument === "fretboard" ? (
        <>
          <FretboardGrid
            positions={positions}
            maxFret={MAX_FRET}
            showCharacteristicNotes={showCharacteristicNotes}
            showAvoidNotes={showAvoidNotes}
          />
          <FretboardLegend />
        </>
      ) : (
        <>
          <PianoKeyboard
            positions={positions}
            showCharacteristicNotes={showCharacteristicNotes}
            showAvoidNotes={showAvoidNotes}
          />
          <FretboardLegend />
        </>
      )}
      {positions.length === 0 && (
        <p className="text-center text-muted text-sm">
          コードを選択すると構成音とスケールが表示されます
        </p>
      )}
    </section>
  );
}
