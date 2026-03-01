import { memo } from "react";
import type { GridChord } from "@/features/chord-grid/stores/chord-grid-store";
import { useChordGridStore } from "@/features/chord-grid/stores/chord-grid-store";
import { useChordPlaybackStore } from "@/features/chord-playback/stores/chord-playback-store";
import { useChordProgressionStore } from "@/features/chord-progression/stores/chord-progression-store";
import { ChordTypeSelector } from "@/features/key-selection/components/chord-type-selector";
import { useCurrentModeChords } from "@/features/key-selection/stores/key-selectors";
import { useKeyStore } from "@/features/key-selection/stores/key-store";
import { replaceSelectedGridCell, selectChordFromPalette } from "@/features/store-coordination";
import { playChord } from "@/lib/audio/chord-player";
import { useDrag } from "@/lib/dnd";
import type { ChordFunction } from "@/lib/music-theory";
import { ChordCard } from "../chord-card";
import type { ChordCardData } from "../chord-card/chord-card";
import { ModeSelector } from "../mode-selector";

export const CHORD_DRAG_TYPE = "chord";

export type PaletteDragData = {
  rootName: string;
  quality: string;
  symbol: string;
  source: string;
  chordFunction: ChordFunction;
  romanNumeral: string;
  degree: number;
};

function isSelectedChord(
  activeChord: { rootName: string; quality: string; source: string } | null,
  rootName: string,
  quality: string,
  source: string
): boolean {
  if (!activeChord) return false;
  return (
    activeChord.rootName === rootName &&
    activeChord.quality === quality &&
    activeChord.source === source
  );
}

type DraggableChordCardProps = {
  chord: ChordCardData;
  isSelected: boolean;
  onClick: () => void;
  dragData: PaletteDragData;
};

const DraggableChordCard = memo(function DraggableChordCard({
  chord,
  isSelected,
  onClick,
  dragData,
}: DraggableChordCardProps) {
  const { dragAttributes, isDragging } = useDrag<PaletteDragData>({
    type: CHORD_DRAG_TYPE,
    data: dragData,
  });

  return (
    <ChordCard
      chord={chord}
      isSelected={isSelected}
      isDragging={isDragging}
      onClick={onClick}
      {...dragAttributes}
    />
  );
});

type ChordPaletteProps = {
  layout?: "row" | "wrap";
};

export function ChordPalette({ layout = "row" }: ChordPaletteProps) {
  const paletteChords = useCurrentModeChords();
  const { selectedMode, chordType, setChordType } = useKeyStore();
  const activeChordOverride = useChordProgressionStore((s) => s.activeChordOverride);

  function getEffectiveSource(chordInfo: (typeof paletteChords)[number]) {
    return (chordInfo.source ?? selectedMode) as Exclude<typeof selectedMode, `category:${string}`>;
  }

  function toGridChord(chordInfo: (typeof paletteChords)[number]): GridChord {
    const source = getEffectiveSource(chordInfo);
    return {
      rootName: chordInfo.chord.root.name,
      quality: chordInfo.chord.quality,
      symbol: chordInfo.chord.symbol,
      source,
      chordFunction: chordInfo.chordFunction,
      romanNumeral: chordInfo.romanNumeral,
      degree: chordInfo.degree,
    };
  }

  function handleClick(chordInfo: (typeof paletteChords)[number]) {
    const gridChord = toGridChord(chordInfo);

    // グリッドでセルが選択中の場合、そのセルのコードを置換する
    const gridSelected = useChordGridStore.getState().selectedCell;
    if (gridSelected) {
      const replaced = replaceSelectedGridCell(gridChord);
      if (replaced) {
        if (!useChordPlaybackStore.getState().isMuted) {
          playChord(gridChord.rootName, gridChord.quality);
        }
        return;
      }
    }

    selectChordFromPalette(gridChord);
    if (!useChordPlaybackStore.getState().isMuted) {
      playChord(gridChord.rootName, gridChord.quality);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4 lg:flex-nowrap">
        <h2 className="font-bold text-lg">Chords</h2>
        <div className="flex items-center gap-2">
          <ModeSelector />
          <ChordTypeSelector value={chordType} onValueChange={setChordType} />
        </div>
      </div>
      <div
        className={
          layout === "wrap"
            ? "grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-1 lg:grid-cols-4 lg:gap-2"
            : "-mx-4 grid auto-cols-[6rem] grid-flow-col gap-2 overflow-x-auto px-4 pb-2"
        }
      >
        {paletteChords.map((chordInfo) => {
          const source = getEffectiveSource(chordInfo);
          const selected = isSelectedChord(
            activeChordOverride,
            chordInfo.chord.root.name,
            chordInfo.chord.quality,
            source as string
          );
          return (
            <DraggableChordCard
              key={`${chordInfo.degree}-${chordInfo.chord.symbol}-${source}`}
              chord={{
                romanNumeral: chordInfo.romanNumeral,
                symbol: chordInfo.chord.symbol,
                chordFunction: chordInfo.chordFunction,
                source,
              }}
              isSelected={selected}
              onClick={() => handleClick(chordInfo)}
              dragData={{
                rootName: chordInfo.chord.root.name,
                quality: chordInfo.chord.quality,
                symbol: chordInfo.chord.symbol,
                source,
                chordFunction: chordInfo.chordFunction,
                romanNumeral: chordInfo.romanNumeral,
                degree: chordInfo.degree,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
