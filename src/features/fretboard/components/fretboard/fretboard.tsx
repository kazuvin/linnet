"use client";

import { TabNav, TabNavItem } from "@/components/ui/tab-nav";
import { useSelectedProgressionChord } from "@/features/chord-progression/stores/chord-progression-selectors";
import { useAvailableScales } from "@/features/fretboard/hooks/use-available-scales";
import { useFretboardPositions } from "@/features/fretboard/hooks/use-fretboard-positions";
import type { InstrumentTab } from "@/features/fretboard/stores/fretboard-store";
import { useFretboardStore } from "@/features/fretboard/stores/fretboard-store";
import { PianoKeyboard } from "@/features/keyboard/components";
import { FretboardControls } from "../fretboard-controls";
import { FretboardGrid } from "../fretboard-grid";
import { FretboardLegend } from "../fretboard-legend";
import { ScaleChecker } from "../scale-checker";

export function Fretboard() {
  const {
    maxFret,
    showCharacteristicNotes,
    showAvoidNotes,
    activeInstrument,
    setActiveInstrument,
  } = useFretboardStore();
  const { availableScales, activeScaleType, scaleRoot } = useAvailableScales();
  const positions = useFretboardPositions(activeScaleType);
  const selectedChord = useSelectedProgressionChord();

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
        {activeInstrument === "fretboard" && <FretboardControls maxFret={maxFret} />}
        <ScaleChecker
          availableScales={availableScales}
          activeScaleType={activeScaleType}
          chordSymbol={selectedChord?.symbol ?? null}
          scaleRoot={scaleRoot}
        />
      </div>
      {activeInstrument === "fretboard" ? (
        <>
          <FretboardGrid
            positions={positions}
            maxFret={maxFret}
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
