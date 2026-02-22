import { DiatonicChordList } from "@/features/diatonic-chords/components/diatonic-chord-list";
import { KeySelector } from "@/features/key-selection/components/key-selector";
import { ModalInterchangeChordList } from "@/features/modal-interchange-chords/components/modal-interchange-chord-list";

export default function Home() {
  return (
    <main className="container mx-auto flex flex-col gap-8 px-4 pt-24 pb-12">
      <KeySelector />
      <DiatonicChordList />
      <ModalInterchangeChordList />
    </main>
  );
}
