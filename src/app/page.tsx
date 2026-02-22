import { ChordBoard } from "@/features/chord-board/components";
import { KeySelector } from "@/features/key-selection/components/key-selector";

export default function Home() {
  return (
    <main className="container mx-auto flex flex-col gap-8 px-4 pt-24 pb-12">
      <KeySelector />
      <ChordBoard />
    </main>
  );
}
