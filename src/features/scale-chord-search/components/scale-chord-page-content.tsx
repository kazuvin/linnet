"use client";

import { Card } from "@/components";
import { AnimatedText } from "@/components/ui/animated-text";
import { ModeSelector } from "@/features/chord-board/components";
import { Fretboard, GuitarVoicingCard } from "@/features/fretboard/components";
import { ChordTypeSelector } from "@/features/key-selection/components/chord-type-selector";
import { RootNoteSelector } from "@/features/key-selection/components/root-note-selector";
import { useKeyStore } from "@/features/key-selection/stores/key-store";
import { changeKey } from "@/features/store-coordination";
import { MODE_DISPLAY_NAMES } from "@/lib/music-theory";
import { ScaleChordResults } from "./scale-chord-results";

const SPECIAL_MODE_LABELS: Record<string, string> = {
  diatonic: "Ionian",
  "secondary-dominant": "Sec.Dom",
  "tritone-substitution": "SubV",
};

function getScaleDisplayText(rootName: string, selectedMode: string): string {
  const label =
    SPECIAL_MODE_LABELS[selectedMode] ?? MODE_DISPLAY_NAMES[selectedMode] ?? selectedMode;
  return `${rootName} ${label}`;
}

export function ScaleChordPageContent() {
  const { rootName, chordType, selectedMode, setChordType } = useKeyStore();
  const scaleDisplayText = getScaleDisplayText(rootName, selectedMode);

  return (
    <>
      {/* スケール選択 */}
      <section className="flex flex-col items-center gap-4">
        <AnimatedText
          text={scaleDisplayText}
          className="font-bold text-5xl tracking-tight lg:text-6xl"
        />
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="shrink-0 font-medium text-muted text-sm">スケール</span>
          <RootNoteSelector value={rootName} onValueChange={changeKey} />
          <ModeSelector />
          <ChordTypeSelector value={chordType} onValueChange={setChordType} />
        </div>
      </section>

      {/* コード一覧（検索結果） */}
      <Card className="min-w-0 overflow-hidden">
        <ScaleChordResults />
      </Card>

      {/* 詳細表示（副次的） */}
      <div className="flex min-w-0 flex-col gap-[var(--grid-gap)] border-foreground/5 border-t pt-[var(--grid-gap)] max-lg:gap-[var(--grid-gap-sm)] max-lg:pt-[var(--grid-gap-sm)]">
        <p className="text-muted text-xs">
          コードをクリックすると、フレットボード上で構成音を確認できます
        </p>
        <Card id="fretboard-section" className="min-w-0 overflow-hidden">
          <Fretboard />
        </Card>
        <GuitarVoicingCard />
      </div>
    </>
  );
}
