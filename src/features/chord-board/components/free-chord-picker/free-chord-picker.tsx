"use client";

import { useState } from "react";
import { FUNCTION_CELL_STYLES } from "@/features/chord-grid/lib/chord-function-styles";
import type { GridChord } from "@/features/chord-grid/stores/chord-grid-store";
import { useChordGridStore } from "@/features/chord-grid/stores/chord-grid-store";
import { useChordPlaybackStore } from "@/features/chord-playback/stores/chord-playback-store";
import { useChordProgressionStore } from "@/features/chord-progression/stores/chord-progression-store";
import { useCurrentModeChords } from "@/features/key-selection/stores/key-selectors";
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
import { ModeSelector } from "../mode-selector";

// --- Free chord picker types & constants ---

type QualityGroup = {
  id: string;
  label: string;
  qualities: ChordQuality[];
};

const QUALITY_GROUPS: QualityGroup[] = [
  { id: "triads", label: "Triads", qualities: ["major", "minor", "diminished", "augmented"] },
  {
    id: "7th",
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
  { id: "sus", label: "Sus", qualities: ["sus2", "sus4", "7sus4"] },
  { id: "6th", label: "6th", qualities: ["6", "minor6"] },
  { id: "add", label: "Add", qualities: ["add9"] },
  {
    id: "9th",
    label: "9th",
    qualities: ["dominant9", "major9", "minor9", "dominant7sharp9", "dominant7flat9"],
  },
];

const ROOT_OPTIONS = NOTE_NAMES.map((sharpName, i) => {
  const flatName = FLAT_NOTE_NAMES[i];
  const label = sharpName === flatName ? sharpName : `${sharpName}/${flatName}`;
  return { value: sharpName, label };
});

// --- Shared components ---

type DraggableChordCardProps = {
  cardData: ChordCardData;
  isSelected: boolean;
  onClick: () => void;
  dragData: PaletteDragData;
};

function DraggableChordCard({ cardData, isSelected, onClick, dragData }: DraggableChordCardProps) {
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

function handleGridAction(gridChord: GridChord) {
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

// --- Free tab content ---

function FreeTabContent() {
  const [selectedRoot, setSelectedRoot] = useState("C");
  const [selectedGroup, setSelectedGroup] = useState("triads");
  const keyRoot = useKeyStore((s) => s.rootName);
  const activeChordOverride = useChordProgressionStore((s) => s.activeChordOverride);

  const group = QUALITY_GROUPS.find((g) => g.id === selectedGroup) ?? QUALITY_GROUPS[0];

  return (
    <>
      {/* Quality group tabs */}
      <div className="flex flex-wrap gap-1">
        {QUALITY_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`rounded-md border px-2 py-1 font-semibold text-xs transition-colors ${
              selectedGroup === g.id
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
            onClick={() => setSelectedGroup(g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Root note selector */}
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

      {/* Chord cards */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-1 lg:grid-cols-4 lg:gap-2">
        {group.qualities.map((quality) => {
          const gridChord = buildFreeGridChord(keyRoot, selectedRoot, quality);
          const selected =
            activeChordOverride?.rootName === selectedRoot &&
            activeChordOverride?.quality === quality &&
            activeChordOverride?.source === "free";
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
            <DraggableChordCard
              key={quality}
              cardData={cardData}
              isSelected={selected}
              onClick={() => handleGridAction(gridChord)}
              dragData={dragData}
            />
          );
        })}
      </div>
    </>
  );
}

// --- Scale tab content ---

function ScaleTabContent() {
  const paletteChords = useCurrentModeChords();
  const { selectedMode, chordType, setChordType } = useKeyStore();
  const activeChordOverride = useChordProgressionStore((s) => s.activeChordOverride);

  function getEffectiveSource(chordInfo: (typeof paletteChords)[number]) {
    return (chordInfo.source ?? selectedMode) as typeof selectedMode;
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

  return (
    <>
      <div className="flex items-center gap-2">
        <ModeSelector />
        <select
          className="rounded-md border border-border bg-background px-2 py-1 text-xs"
          value={chordType}
          onChange={(e) => setChordType(e.target.value as "triad" | "seventh")}
        >
          <option value="triad">Triad</option>
          <option value="seventh">Seventh</option>
        </select>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-1 lg:grid-cols-4 lg:gap-2">
        {paletteChords.map((chordInfo) => {
          const source = getEffectiveSource(chordInfo);
          const gridChord = toGridChord(chordInfo);
          const selected =
            activeChordOverride?.rootName === chordInfo.chord.root.name &&
            activeChordOverride?.quality === chordInfo.chord.quality &&
            activeChordOverride?.source === (source as string);

          return (
            <DraggableChordCard
              key={`${chordInfo.degree}-${chordInfo.chord.symbol}-${source}`}
              cardData={{
                romanNumeral: chordInfo.romanNumeral,
                symbol: chordInfo.chord.symbol,
                chordFunction: chordInfo.chordFunction,
                source,
              }}
              isSelected={selected}
              onClick={() => handleGridAction(gridChord)}
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
    </>
  );
}

// --- Main component ---

type TabId = "free" | "scale";

export function FreeChordPicker() {
  const [activeTab, setActiveTab] = useState<TabId>("free");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <h2 className="font-bold text-lg">Chords</h2>
        <div className="flex rounded-lg border border-border">
          <button
            type="button"
            className={`rounded-l-lg px-3 py-1 font-semibold text-xs transition-colors ${
              activeTab === "free"
                ? "bg-foreground text-background"
                : "bg-background text-foreground hover:bg-muted"
            }`}
            onClick={() => setActiveTab("free")}
          >
            Free
          </button>
          <button
            type="button"
            className={`rounded-r-lg border-border border-l px-3 py-1 font-semibold text-xs transition-colors ${
              activeTab === "scale"
                ? "bg-foreground text-background"
                : "bg-background text-foreground hover:bg-muted"
            }`}
            onClick={() => setActiveTab("scale")}
          >
            Scale
          </button>
        </div>
      </div>

      {activeTab === "free" ? <FreeTabContent /> : <ScaleTabContent />}

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
