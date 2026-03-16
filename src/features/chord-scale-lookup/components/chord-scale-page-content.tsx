"use client";

import { Card } from "@/components";
import { ChordSelector, ScaleCard, useChordScaleData, VoicingCard } from "./chord-scale-lookup";

function VoicingSection({ data }: { data: ReturnType<typeof useChordScaleData> }) {
  const { chordSymbol, voicings, activeInstrument } = data;

  if (activeInstrument !== "fretboard" || voicings.length === 0) return null;

  return (
    <div className="border-foreground/5 border-t pt-[var(--grid-gap)] max-lg:pt-[var(--grid-gap-sm)]">
      <Card>
        <VoicingCard data={{ chordSymbol, voicings, activeInstrument }} />
      </Card>
    </div>
  );
}

export function ChordScalePageContent() {
  const data = useChordScaleData();

  return (
    <>
      {/* コード選択（メイン入力） */}
      <ChordSelector data={data} />

      {/* スケール表示（メイン結果） */}
      <Card>
        <ScaleCard data={data} />
      </Card>

      {/* ボイシング（副次的） */}
      <VoicingSection data={data} />
    </>
  );
}
