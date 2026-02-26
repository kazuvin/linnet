"use client";

import { useState } from "react";
import { TabNav, TabNavItem } from "@/components/ui/tab-nav";
import { useSelectedProgressionChord } from "@/features/chord-progression/stores/chord-progression-store";
import { useAvailableScales } from "@/features/fretboard/hooks/use-available-scales";
import { useFretboardPositions } from "@/features/fretboard/hooks/use-fretboard-positions";
import { useFretboardSnapshot } from "@/features/fretboard/stores/fretboard-store";
import { PianoKeyboard } from "@/features/keyboard/components";
import { FretboardControls } from "../fretboard-controls";
import { FretboardGrid } from "../fretboard-grid";
import { FretboardLegend } from "../fretboard-legend";
import { ScaleChecker } from "../scale-checker";

type InstrumentTab = "fretboard" | "keyboard";

export function Fretboard() {
  const [activeTab, setActiveTab] = useState<InstrumentTab>("fretboard");
  const { maxFret, showCharacteristicNotes, showAvoidNotes } = useFretboardSnapshot();
  const { availableScales, activeScaleType, scaleRoot } = useAvailableScales();
  const positions = useFretboardPositions(activeScaleType);
  const selectedChord = useSelectedProgressionChord();

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <TabNav value={activeTab} onValueChange={(v) => setActiveTab(v as InstrumentTab)}>
          <TabNavItem value="fretboard">フレットボード</TabNavItem>
          <TabNavItem value="keyboard">鍵盤</TabNavItem>
        </TabNav>
        {activeTab === "fretboard" && <FretboardControls maxFret={maxFret} />}
      </div>
      {selectedChord && (
        <ScaleChecker
          availableScales={availableScales}
          activeScaleType={activeScaleType}
          chordSymbol={selectedChord.symbol}
          scaleRoot={scaleRoot}
        />
      )}
      {activeTab === "fretboard" ? (
        <FretboardGrid
          positions={positions}
          maxFret={maxFret}
          showCharacteristicNotes={showCharacteristicNotes}
          showAvoidNotes={showAvoidNotes}
        />
      ) : (
        <PianoKeyboard
          positions={positions}
          showCharacteristicNotes={showCharacteristicNotes}
          showAvoidNotes={showAvoidNotes}
        />
      )}
      <FretboardLegend />
      {positions.length === 0 && (
        <p className="text-center text-muted text-sm">
          コードを選択すると構成音とスケールが表示されます
        </p>
      )}
    </section>
  );
}
