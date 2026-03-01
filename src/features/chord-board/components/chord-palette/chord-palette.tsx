import { useMemo } from "react";
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
import type { ChordFunction, ChordQuality } from "@/lib/music-theory";
import { findAvailableScalesForChord, getChordNotes } from "@/lib/music-theory";
import { useCardDisplayStore } from "../../stores/card-display-store";
import { CardDisplayFilter } from "../card-display-filter";
import { ChordCard } from "../chord-card";
import type { ChordCardData, ChordCardDetailItem } from "../chord-card/chord-card";
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
  detailItems?: ChordCardDetailItem[];
};

function DraggableChordCard({
  chord,
  isSelected,
  onClick,
  dragData,
  detailItems,
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
      detailItems={detailItems}
      {...dragAttributes}
    />
  );
}

type ChordPaletteProps = {
  layout?: "row" | "wrap";
};

function useChordDetailItems(
  rootName: string,
  quality: ChordQuality,
  degree: number,
  keyRoot: string
): ChordCardDetailItem[] {
  const activeOptions = useCardDisplayStore((s) => s.activeOptions);

  return useMemo(() => {
    const items: ChordCardDetailItem[] = [];

    if (activeOptions.has("tones")) {
      const notes = getChordNotes(rootName, quality);
      items.push({ label: "構成音", value: notes.map((n) => n.name).join(" ") });
    }

    if (activeOptions.has("scale")) {
      const scales = findAvailableScalesForChord(keyRoot, degree, rootName, quality);
      if (scales.length > 0) {
        items.push({
          label: "スケール",
          value: scales.map((s) => s.displayName).join(", "),
        });
      }
    }

    return items;
  }, [rootName, quality, degree, keyRoot, activeOptions]);
}

function ChordCardWithDetail({
  chordInfo,
  source,
  selected,
  keyRoot,
  onClick,
}: {
  chordInfo: {
    chord: { root: { name: string }; quality: ChordQuality; symbol: string };
    romanNumeral: string;
    chordFunction: ChordFunction;
    degree: number;
  };
  source: string;
  selected: boolean;
  keyRoot: string;
  onClick: () => void;
}) {
  const detailItems = useChordDetailItems(
    chordInfo.chord.root.name,
    chordInfo.chord.quality,
    chordInfo.degree,
    keyRoot
  );

  return (
    <DraggableChordCard
      chord={{
        romanNumeral: chordInfo.romanNumeral,
        symbol: chordInfo.chord.symbol,
        chordFunction: chordInfo.chordFunction,
        source: source as ChordCardData["source"],
      }}
      isSelected={selected}
      onClick={onClick}
      dragData={{
        rootName: chordInfo.chord.root.name,
        quality: chordInfo.chord.quality,
        symbol: chordInfo.chord.symbol,
        source,
        chordFunction: chordInfo.chordFunction,
        romanNumeral: chordInfo.romanNumeral,
        degree: chordInfo.degree,
      }}
      detailItems={detailItems}
    />
  );
}

export function ChordPalette({ layout = "row" }: ChordPaletteProps) {
  const paletteChords = useCurrentModeChords();
  const { selectedMode, chordType, setChordType } = useKeyStore();
  const rootName = useKeyStore((s) => s.rootName);
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
        <CardDisplayFilter className="ml-auto" />
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
            <ChordCardWithDetail
              key={`${chordInfo.degree}-${chordInfo.chord.symbol}-${source}`}
              chordInfo={chordInfo}
              source={source}
              selected={selected}
              keyRoot={rootName}
              onClick={() => handleClick(chordInfo)}
            />
          );
        })}
      </div>
    </div>
  );
}
