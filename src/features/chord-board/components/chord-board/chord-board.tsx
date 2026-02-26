"use client";

import { useChordProgressionStore } from "@/features/chord-progression/stores/chord-progression-store";
import { useFlipAnimation } from "../../hooks/use-flip-animation";
import { useNativeDnd } from "../../hooks/use-native-dnd";
import { ChordPalette } from "../chord-palette";
import { ProgressionLane } from "../progression-lane";

export function ChordBoard() {
  const chords = useChordProgressionStore((s) => s.chords);

  const chordKeys = chords.map((c) => c.id);
  const { containerRef, capturePositions } = useFlipAnimation(chordKeys);
  const {
    createPaletteDragHandlers,
    createProgressionDragHandlers,
    createDropZoneHandlers,
    containerDropHandlers,
  } = useNativeDnd({
    onBeforeReorder: capturePositions,
    chordsCount: chords.length,
    containerRef,
  });

  return (
    <section className="flex flex-col gap-6">
      <ChordPalette createDragHandlers={createPaletteDragHandlers} />
      <ProgressionLane
        containerRef={containerRef}
        containerDropHandlers={containerDropHandlers}
        createDragHandlers={createProgressionDragHandlers}
        createDropZoneHandlers={createDropZoneHandlers}
      />
    </section>
  );
}
