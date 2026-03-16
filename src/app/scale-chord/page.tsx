import type { Metadata } from "next";
import { PageTransition } from "@/components";
import { ScaleChordPageContent } from "@/features/scale-chord-search/components";

export const metadata: Metadata = {
  title: "スケールからコード検索",
  description: "スケールを選択して含まれるコードとボイシングを確認できます。",
};

export default function ScaleChordPage() {
  return (
    <PageTransition>
      <main className="container mx-auto grid gap-[var(--grid-gap)] overflow-x-hidden px-4 pt-24 pb-12 max-lg:gap-[var(--grid-gap-sm)]">
        <ScaleChordPageContent />
      </main>
    </PageTransition>
  );
}
