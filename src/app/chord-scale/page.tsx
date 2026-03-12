import type { Metadata } from "next";
import { Card, PageTransition } from "@/components";
import { ChordSelector, ScaleCard, VoicingCard } from "@/features/chord-scale-lookup/components";

export const metadata: Metadata = {
  title: "コード・スケール検索",
  description: "コードを選択して使えるスケールとボイシングを確認できます。",
};

export default function ChordScalePage() {
  return (
    <PageTransition>
      <main className="container mx-auto grid gap-[var(--grid-gap)] overflow-x-hidden px-4 pt-24 pb-12 max-lg:gap-[var(--grid-gap-sm)]">
        <ChordSelector />
        <Card>
          <ScaleCard />
        </Card>
        <Card>
          <VoicingCard />
        </Card>
      </main>
    </PageTransition>
  );
}
