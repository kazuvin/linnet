"use client";

import { Card } from "@/components";
import { AnimatedText } from "@/components/ui/animated-text";
import { type ModeOption, ModeSelector } from "@/features/chord-board/components";
import { useChordProgressionStore } from "@/features/chord-progression/stores/chord-progression-store";
import { Fretboard, GuitarVoicingCard } from "@/features/fretboard/components";
import { RootNoteSelector } from "@/features/key-selection/components/root-note-selector";
import type { SelectedMode } from "@/features/key-selection/stores/key-store";
import { useKeyStore } from "@/features/key-selection/stores/key-store";
import { changeKey } from "@/features/store-coordination";
import { ALL_MODE_SOURCES, MODE_DISPLAY_NAMES } from "@/lib/music-theory";
import { ScaleChordResults } from "./scale-chord-results";

const SCALE_CHORD_MODE_OPTIONS: readonly ModeOption[] = [
  { value: "diatonic", label: "Ionian" },
  ...ALL_MODE_SOURCES.map((source) => ({
    value: source as SelectedMode,
    label: MODE_DISPLAY_NAMES[source],
  })),
  { value: "locrian" as SelectedMode, label: "Locrian" },
];

const MODE_LABEL_MAP = Object.fromEntries(SCALE_CHORD_MODE_OPTIONS.map((o) => [o.value, o.label]));

function getScaleDisplayText(rootName: string, selectedMode: string): string {
  const label = MODE_LABEL_MAP[selectedMode] ?? selectedMode;
  return `${rootName} ${label}`;
}

export function ScaleChordPageContent() {
  const { rootName, selectedMode } = useKeyStore();
  const activeChordOverride = useChordProgressionStore((s) => s.activeChordOverride);
  const scaleDisplayText = getScaleDisplayText(rootName, selectedMode);
  const hasSelectedChord = activeChordOverride !== null;

  return (
    <>
      {/* スケール選択 */}
      <section className="flex flex-col items-center gap-4">
        <AnimatedText
          text={scaleDisplayText}
          className="font-bold text-4xl tracking-tight lg:text-5xl"
        />
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="shrink-0 font-medium text-muted text-sm">スケール</span>
          <RootNoteSelector value={rootName} onValueChange={changeKey} />
          <ModeSelector modeOptions={SCALE_CHORD_MODE_OPTIONS} />
        </div>
      </section>

      {/* コード一覧（検索結果） */}
      <Card className="min-w-0 overflow-hidden">
        <ScaleChordResults />
      </Card>

      {/* 詳細表示（コード選択時のみ表示） */}
      {hasSelectedChord && (
        <div className="flex min-w-0 flex-col gap-[var(--grid-gap)] border-foreground/5 border-t pt-[var(--grid-gap)] max-lg:gap-[var(--grid-gap-sm)] max-lg:pt-[var(--grid-gap-sm)]">
          <p className="text-muted text-xs">
            コードをクリックすると、フレットボード上で構成音を確認できます
          </p>
          <Card id="fretboard-section" className="min-w-0 overflow-hidden">
            <Fretboard />
          </Card>
          <GuitarVoicingCard />
        </div>
      )}
    </>
  );
}
