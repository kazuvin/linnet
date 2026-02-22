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
      <ul className="grid grid-cols-4 gap-3 sm:grid-cols-7">
        {chords.map((chordInfo) => (
          <li key={chordInfo.degree}>
            <DiatonicChordCard chordInfo={chordInfo} />
          </li>
        ))}
      </ul>
    </section>
  );
}
