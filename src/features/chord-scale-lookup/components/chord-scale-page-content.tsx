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
      {/* ページヘッダー */}
      <section>
        <h1 className="font-bold text-3xl tracking-tight lg:text-4xl">コードからスケール検索</h1>
        <p className="mt-2 text-muted text-sm">コードを選択すると、使えるスケールが表示されます</p>
      </section>

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
