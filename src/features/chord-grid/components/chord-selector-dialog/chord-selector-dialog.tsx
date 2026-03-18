"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabNav, TabNavItem } from "@/components/ui/tab-nav";
import { ModeSelector } from "@/features/chord-board/components/mode-selector";
import { FUNCTION_CELL_STYLES } from "@/features/chord-grid/lib/chord-function-styles";
import type { GridChord } from "@/features/chord-grid/stores/chord-grid-store";
import { useCurrentModeChords } from "@/features/key-selection/stores/key-selectors";
import { useKeyStore } from "@/features/key-selection/stores/key-store";
import {
  buildFreeGridChord,
  type ChordQuality,
  FLAT_NOTE_NAMES,
  NOTE_NAMES,
} from "@/lib/music-theory";
import { cn } from "@/lib/utils";

// --- Quality filter groups ---

type QualityGroup = {
  id: string;
  label: string;
  qualities: ChordQuality[];
};

const QUALITY_GROUPS: QualityGroup[] = [
  { id: "all", label: "All", qualities: [] },
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
      "augmentedMajor7",
    ],
  },
  { id: "sus", label: "Sus", qualities: ["sus2", "sus4", "7sus2", "7sus4"] },
  { id: "6th", label: "6th", qualities: ["6", "minor6"] },
  { id: "9th", label: "9th", qualities: ["add9", "dominant9", "major9", "minor9"] },
  { id: "11th", label: "11th", qualities: ["dominant11", "minor11"] },
  { id: "13th", label: "13th", qualities: ["dominant13", "major13", "minor13"] },
  {
    id: "altered",
    label: "Altered",
    qualities: ["dominant7flat5", "dominant7sharp9", "dominant7flat9"],
  },
];

const ALL_QUALITIES: ChordQuality[] = QUALITY_GROUPS.filter((g) => g.id !== "all").flatMap(
  (g) => g.qualities
);

const ORDERED_ROOTS = NOTE_NAMES; // C, C#, D, D#, E, F, F#, G, G#, A, A#, B

function getRootLabel(name: string, index: number): string {
  const flat = FLAT_NOTE_NAMES[index];
  return name === flat ? name : `${name}/${flat}`;
}

// --- Free tab: all chords C→B with filter ---

function FreeTabContent({ onSelect }: { onSelect: (chord: GridChord) => void }) {
  const [filterGroup, setFilterGroup] = useState("all");
  const keyRoot = useKeyStore((s) => s.rootName);

  const qualities =
    filterGroup === "all"
      ? ALL_QUALITIES
      : (QUALITY_GROUPS.find((g) => g.id === filterGroup)?.qualities ?? ALL_QUALITIES);

  const chords = useMemo(() => {
    const result: GridChord[] = [];
    for (let i = 0; i < ORDERED_ROOTS.length; i++) {
      const root = ORDERED_ROOTS[i];
      for (const quality of qualities) {
        result.push(buildFreeGridChord(keyRoot, root, quality));
      }
    }
    return result;
  }, [keyRoot, qualities]);

  return (
    <div className="flex flex-col gap-3">
      {/* フィルター */}
      <div className="-mx-1 overflow-x-auto px-1">
        <div className="flex gap-1">
          {QUALITY_GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 font-medium text-xs transition-colors",
                filterGroup === g.id
                  ? "bg-foreground text-background"
                  : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
              )}
              onClick={() => setFilterGroup(g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* コード一覧 */}
      <div className="max-h-[50vh] overflow-y-auto">
        <div className="grid grid-cols-1 gap-1">
          {ORDERED_ROOTS.map((root, rootIdx) => {
            const rootChords = chords.filter((c) => c.rootName === root);
            if (rootChords.length === 0) return null;
            return (
              <div key={root}>
                <div className="sticky top-0 z-10 bg-background/95 px-1 py-1 font-bold text-muted text-xs backdrop-blur-sm">
                  {getRootLabel(root, rootIdx)}
                </div>
                <div className="grid grid-cols-3 gap-1 sm:grid-cols-4">
                  {rootChords.map((chord) => (
                    <button
                      key={`${chord.rootName}-${chord.quality}`}
                      type="button"
                      className={cn(
                        "flex items-center justify-center rounded-lg px-2 py-2.5 font-medium text-sm transition-all active:scale-95",
                        FUNCTION_CELL_STYLES[chord.chordFunction] ??
                          "border border-foreground/10 bg-background"
                      )}
                      onClick={() => onSelect(chord)}
                    >
                      {chord.symbol}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- Mode tab: chords based on selected mode ---

function ModeTabContent({ onSelect }: { onSelect: (chord: GridChord) => void }) {
  const paletteChords = useCurrentModeChords();
  const { selectedMode, chordType, setChordType } = useKeyStore();

  function toGridChord(chordInfo: (typeof paletteChords)[number]): GridChord {
    const source = (chordInfo.source ?? selectedMode) as GridChord["source"];
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
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <ModeSelector />
        <Select value={chordType} onValueChange={(v) => setChordType(v as "triad" | "seventh")}>
          <SelectTrigger>
            <SelectValue>{chordType === "triad" ? "Triad" : "Seventh"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="triad">Triad</SelectItem>
            <SelectItem value="seventh">Seventh</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
        {paletteChords.map((chordInfo) => {
          const source = (chordInfo.source ?? selectedMode) as GridChord["source"];
          const gridChord = toGridChord(chordInfo);
          return (
            <button
              key={`${chordInfo.degree}-${chordInfo.chord.symbol}-${source}`}
              type="button"
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2.5 transition-all active:scale-95",
                FUNCTION_CELL_STYLES[chordInfo.chordFunction] ??
                  "border border-foreground/10 bg-background"
              )}
              onClick={() => onSelect(gridChord)}
            >
              <span className="text-[10px] text-muted">{chordInfo.romanNumeral}</span>
              <span className="font-bold text-sm">{chordInfo.chord.symbol}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- Main Dialog ---

type TabId = "free" | "mode";

type ChordSelectorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (chord: GridChord) => void;
  title?: string;
};

export function ChordSelectorDialog({
  open,
  onOpenChange,
  onSelect,
  title = "コードを選択",
}: ChordSelectorDialogProps) {
  const [activeTab, setActiveTab] = useState<TabId>("free");

  const handleSelect = (chord: GridChord) => {
    onSelect(chord);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>{title}</DialogTitle>
            <TabNav value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)} size="sm">
              <TabNavItem value="free">Free</TabNavItem>
              <TabNavItem value="mode">Mode</TabNavItem>
            </TabNav>
          </div>
        </DialogHeader>
        <div className="mt-2">
          {activeTab === "free" ? (
            <FreeTabContent onSelect={handleSelect} />
          ) : (
            <ModeTabContent onSelect={handleSelect} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
