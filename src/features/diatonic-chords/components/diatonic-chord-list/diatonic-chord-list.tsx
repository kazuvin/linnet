"use client";

import type { ComponentProps } from "react";
import { useDiatonicChords } from "@/features/key-selection/stores/key-store";
import { cn } from "@/lib/utils";
import { DiatonicChordCard } from "../diatonic-chord-card";

export type DiatonicChordListProps = ComponentProps<"section">;

export function DiatonicChordList({ className, ...props }: DiatonicChordListProps) {
  const chords = useDiatonicChords();

  return (
    <section className={cn("flex flex-col gap-4", className)} {...props}>
      <h2 className="font-bold text-lg">Diatonic Chords</h2>
      <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
        {chords.map((chordInfo) => (
          <li key={chordInfo.degree} className="shrink-0">
            <DiatonicChordCard chordInfo={chordInfo} className="w-28" />
          </li>
        ))}
      </ul>
    </section>
  );
}
