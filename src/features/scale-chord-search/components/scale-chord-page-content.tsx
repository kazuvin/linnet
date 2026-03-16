"use client";

import { Card } from "@/components";
import { ModeSelector } from "@/features/chord-board/components";
import { Fretboard, GuitarVoicingCard } from "@/features/fretboard/components";
import { ChordTypeSelector } from "@/features/key-selection/components/chord-type-selector";
import { KeySelector } from "@/features/key-selection/components/key-selector";
import { useKeyStore } from "@/features/key-selection/stores/key-store";
import { ScaleChordResults } from "./scale-chord-results";

export function ScaleChordPageContent() {
  const { chordType, setChordType } = useKeyStore();

  return (
    <>
      {/* スケール選択 */}
      <KeySelector className="flex-wrap">
        <ModeSelector />
        <ChordTypeSelector value={chordType} onValueChange={setChordType} />
      </KeySelector>

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
