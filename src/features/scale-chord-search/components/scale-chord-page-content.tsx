"use client";

import { Card } from "@/components";
import { ChordBoard } from "@/features/chord-board/components";
import { Fretboard, GuitarVoicingCard } from "@/features/fretboard/components";
import { KeySelector } from "@/features/key-selection/components/key-selector";

export function ScaleChordPageContent() {
  return (
    <>
      {/* ページヘッダー */}
      <section>
        <h1 className="font-bold text-3xl tracking-tight lg:text-4xl">スケールからコード検索</h1>
        <p className="mt-2 text-muted text-sm">
          キーとスケールを選択すると、含まれるコードが表示されます
        </p>
      </section>

      {/* スケール選択（メイン入力） */}
      <KeySelector />

      {/* コード一覧（メイン結果） */}
      <Card className="min-w-0 overflow-y-auto overflow-x-hidden">
        <ChordBoard layout="wrap" interactionMode="view" heading="含まれるコード" />
      </Card>

      {/* 詳細表示（副次的） */}
      <div className="flex flex-col gap-[var(--grid-gap)] border-foreground/5 border-t pt-[var(--grid-gap)] max-lg:gap-[var(--grid-gap-sm)] max-lg:pt-[var(--grid-gap-sm)]">
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
