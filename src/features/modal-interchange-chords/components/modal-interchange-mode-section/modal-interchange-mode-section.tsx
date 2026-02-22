import type { ComponentProps } from "react";
import { DiatonicChordCard } from "@/features/diatonic-chords/components/diatonic-chord-card";
import type { ModalInterchangeModeGroup } from "@/features/key-selection/stores/key-store";
import { getChordFunction } from "@/lib/music-theory";
import { cn } from "@/lib/utils";

export type ModalInterchangeModeSectionProps = ComponentProps<"section"> & {
  modeGroup: ModalInterchangeModeGroup;
};

export function ModalInterchangeModeSection({
  modeGroup,
  className,
  ...props
}: ModalInterchangeModeSectionProps) {
  const { displayName, chords } = modeGroup;

  return (
    <section className={cn("flex flex-col gap-3", className)} {...props}>
      <h3 className="font-semibold text-muted text-sm">{displayName}</h3>
      <ul className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
        {chords.map((chordInfo) => (
          <li key={chordInfo.degree} className="shrink-0">
            <DiatonicChordCard
              chordInfo={{
                degree: chordInfo.degree,
                romanNumeral: chordInfo.romanNumeral,
                chord: chordInfo.chord,
                chordFunction: getChordFunction(chordInfo.degree),
              }}
              dimmed={!chordInfo.isAvailable}
              compact
              className="w-20"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
