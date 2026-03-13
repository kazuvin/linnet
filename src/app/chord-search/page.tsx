import type { Metadata } from "next";
import { PageTransition } from "@/components";
import { ChordSearchPanel } from "@/features/chord-search/components";

export const metadata: Metadata = {
  title: "コード検索",
  description: "フレットボード上の音をクリックしてコードを検索できます。",
};

export default function ChordSearchPage() {
  return (
    <PageTransition>
      <main className="container mx-auto grid gap-[var(--grid-gap)] overflow-x-hidden px-4 pt-24 pb-12 max-lg:gap-[var(--grid-gap-sm)]">
        <h1 className="font-bold text-3xl tracking-tight lg:text-4xl">コード検索</h1>
        <ChordSearchPanel />
      </main>
    </PageTransition>
  );
}
