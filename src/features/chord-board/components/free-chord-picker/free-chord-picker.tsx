"use client";

import { useState } from "react";
import { FUNCTION_CELL_STYLES } from "@/features/chord-grid/lib/chord-function-styles";
import { useChordGridStore } from "@/features/chord-grid/stores/chord-grid-store";
import { useChordPlaybackStore } from "@/features/chord-playback/stores/chord-playback-store";
import { useChordProgressionStore } from "@/features/chord-progression/stores/chord-progression-store";
import { ChordTypeSelector } from "@/features/key-selection/components/chord-type-selector";
import { useKeyStore } from "@/features/key-selection/stores/key-store";
import { addChordToGrid, replaceSelectedGridCell } from "@/features/store-coordination";
import { playChord } from "@/lib/audio/chord-player";
import { DragOverlay, useDrag } from "@/lib/dnd";
import {
  buildFreeGridChord,
  type ChordQuality,
  FLAT_NOTE_NAMES,
  NOTE_NAMES,
} from "@/lib/music-theory";
import { ChordCard, type ChordCardData } from "../chord-card/chord-card";
import type { PaletteDragData } from "../chord-palette/chord-palette";

type QualityGroup = {
  label: string;
  qualities: ChordQuality[];
};

const QUALITY_GROUPS: QualityGroup[] = [
  {
    label: "Triads",
    qualities: ["major", "minor", "diminished", "augmented"],
  },
  {
    label: "7th",
    qualities: [
      "major7",
      "minor7",
      "dominant7",
      "minor7b5",
      "diminished7",
      "augmented7",
      "minorMajor7",
    ],
  },
  {
    label: "Sus",
    qualities: ["sus2", "sus4", "7sus4"],
  },
  {
    label: "6th / Add",
    qualities: ["6", "minor6", "add9"],
  },
  {
    label: "9th",
    qualities: ["dominant9", "major9", "minor9", "dominant7sharp9", "dominant7flat9"],
  },
];

const ROOT_OPTIONS = NOTE_NAMES.map((sharpName, i) => {
  const flatName = FLAT_NOTE_NAMES[i];
  const label = sharpName === flatName ? sharpName : `${sharpName}/${flatName}`;
  return { value: sharpName, label };
});

function isSelectedChord(
  activeChord: { rootName: string; quality: string; source: string } | null,
  rootName: string,
  quality: string
): boolean {
  if (!activeChord) return false;
  return (
    activeChord.rootName === rootName &&
    activeChord.quality === quality &&
    activeChord.source === "free"
  );
}

type DraggableChordButtonProps = {
  cardData: ChordCardData;
  isSelected: boolean;
  onClick: () => void;
  dragData: PaletteDragData;
};

function DraggableChordButton({
  cardData,
  isSelected,
  onClick,
  dragData,
}: DraggableChordButtonProps) {
  const { dragAttributes, isDragging } = useDrag<PaletteDragData>({
    type: "chord",
    data: dragData,
  });

  return (
    <ChordCard
      chord={cardData}
      isSelected={isSelected}
      isDragging={isDragging}
      onClick={onClick}
      {...dragAttributes}
    />
  );
}

export function FreeChordPicker() {
  const [selectedRoot, setSelectedRoot] = useState("C");
  const keyRoot = useKeyStore((s) => s.rootName);
  const { chordType, setChordType } = useKeyStore();
  const activeChordOverride = useChordProgressionStore((s) => s.activeChordOverride);

  const visibleGroups =
    chordType === "triad"
      ? QUALITY_GROUPS.filter((g) => g.label === "Triads" || g.label === "Sus")
      : QUALITY_GROUPS;

  function handleChordClick(quality: ChordQuality) {
    const gridChord = buildFreeGridChord(keyRoot, selectedRoot, quality);

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

    addChordToGrid(gridChord);
    if (!useChordPlaybackStore.getState().isMuted) {
      playChord(gridChord.rootName, gridChord.quality);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4 lg:flex-nowrap">
        <h2 className="font-bold text-lg">Chords</h2>
        <ChordTypeSelector value={chordType} onValueChange={setChordType} />
      </div>

      {/* Root note selector buttons */}
      <div className="flex flex-wrap gap-1">
        {ROOT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`rounded-md border px-2 py-1 font-semibold text-xs transition-colors ${
              selectedRoot === option.value
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
            onClick={() => setSelectedRoot(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Quality groups with chord cards */}
      <div className="flex flex-col gap-3">
        {visibleGroups.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">{group.label}</span>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-1 lg:grid-cols-7 lg:gap-2">
              {group.qualities.map((quality) => {
                const gridChord = buildFreeGridChord(keyRoot, selectedRoot, quality);
                const selected = isSelectedChord(activeChordOverride, selectedRoot, quality);
                const cardData: ChordCardData = {
                  romanNumeral: gridChord.romanNumeral,
                  symbol: gridChord.symbol,
                  chordFunction: gridChord.chordFunction,
                  source: "free",
                };
                const dragData: PaletteDragData = {
                  rootName: gridChord.rootName,
                  quality: gridChord.quality,
                  symbol: gridChord.symbol,
                  source: "free",
                  chordFunction: gridChord.chordFunction,
                  romanNumeral: gridChord.romanNumeral,
                  degree: gridChord.degree,
                };

                return (
                  <DraggableChordButton
                    key={quality}
                    cardData={cardData}
                    isSelected={selected}
                    onClick={() => handleChordClick(quality)}
                    dragData={dragData}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <DragOverlay>
        {(item) => {
          const data = item.data as PaletteDragData;
          const bg =
            FUNCTION_CELL_STYLES[data.chordFunction] ?? "border-foreground/10 bg-background";
          return (
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-sm border shadow-lg ${bg}`}
            >
              <span className="font-bold text-[8px] leading-none">{data.symbol}</span>
            </div>
          );
        }}
      </DragOverlay>
    </div>
  );
}
