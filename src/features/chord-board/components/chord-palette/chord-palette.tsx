import { useChordGridStore } from "@/features/chord-grid/stores/chord-grid-store";
import { useChordPlaybackStore } from "@/features/chord-playback/stores/chord-playback-store";
import { useChordProgressionStore } from "@/features/chord-progression/stores/chord-progression-store";
import { ChordTypeSelector } from "@/features/key-selection/components/chord-type-selector";
import { useCurrentModeChords } from "@/features/key-selection/stores/key-selectors";
import { useKeyStore } from "@/features/key-selection/stores/key-store";
import { replaceSelectedGridCell, selectChordFromPalette } from "@/features/store-coordination";
import { playChord } from "@/lib/audio/chord-player";
import type { ChordFunction } from "@/lib/music-theory";
import { formatChordSymbol } from "@/lib/music-theory";
import { ChordCard } from "../chord-card";
import { ModeSelector } from "../mode-selector";

const DRAG_DATA_TYPE = "application/x-chord";

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

  function handleClick(chordInfo: (typeof paletteChords)[number]) {
    const source = getEffectiveSource(chordInfo);

    // グリッドでセルが選択中の場合、そのセルのコードを置換する
    const gridSelected = useChordGridStore.getState().selectedCell;
    if (gridSelected) {
      const replaced = replaceSelectedGridCell({
        rootName: chordInfo.chord.root.name,
        quality: chordInfo.chord.quality,
        symbol: formatChordSymbol(chordInfo.chord.root.name, chordInfo.chord.quality),
        source,
        chordFunction: chordInfo.chordFunction,
        romanNumeral: chordInfo.romanNumeral,
        degree: chordInfo.degree,
      });
      if (replaced) {
        if (!useChordPlaybackStore.getState().isMuted) {
          playChord(chordInfo.chord.root.name, chordInfo.chord.quality);
        }
        return;
      }
    }

    selectChordFromPalette(
      chordInfo.chord.root.name,
      chordInfo.chord.quality,
      source,
      chordInfo.chordFunction,
      chordInfo.romanNumeral,
      chordInfo.degree
    );
    if (!useChordPlaybackStore.getState().isMuted) {
      playChord(chordInfo.chord.root.name, chordInfo.chord.quality);
    }
  }

  function handleDragStart(e: React.DragEvent, chordInfo: (typeof paletteChords)[number]) {
    const source = getEffectiveSource(chordInfo);
    const data: PaletteDragData = {
      rootName: chordInfo.chord.root.name,
      quality: chordInfo.chord.quality,
      symbol: chordInfo.chord.symbol,
      source,
      chordFunction: chordInfo.chordFunction,
      romanNumeral: chordInfo.romanNumeral,
      degree: chordInfo.degree,
    };
    e.dataTransfer.setData(DRAG_DATA_TYPE, JSON.stringify(data));
    e.dataTransfer.effectAllowed = "copy";
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="font-bold text-lg">Chords</h2>
        <div className="flex items-center gap-2">
          <ModeSelector />
          <ChordTypeSelector value={chordType} onValueChange={setChordType} />
        </div>
      </div>
      <div
        className={
          layout === "wrap"
            ? "-mx-4 grid auto-cols-[6rem] grid-flow-col gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-3 lg:overflow-visible lg:px-0 lg:pb-0"
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
            <ChordCard
              key={`${chordInfo.degree}-${chordInfo.chord.symbol}-${source}`}
              chord={{
                romanNumeral: chordInfo.romanNumeral,
                symbol: chordInfo.chord.symbol,
                chordFunction: chordInfo.chordFunction,
                source,
              }}
              isSelected={selected}
              onClick={() => handleClick(chordInfo)}
              draggable
              onDragStart={(e) => handleDragStart(e, chordInfo)}
            />
          );
        })}
      </div>
    </div>
  );
}
