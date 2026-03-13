"use client";

import { NOTE_NAMES, type PitchClass } from "@/lib/music-theory";
import { cn } from "@/lib/utils";

const DISPLAY_NOTE_NAMES = [
  "C",
  "C#/Db",
  "D",
  "D#/Eb",
  "E",
  "F",
  "F#/Gb",
  "G",
  "G#/Ab",
  "A",
  "A#/Bb",
  "B",
] as const;

type NoteSelectorProps = {
  selectedPitchClasses: readonly PitchClass[];
  onToggle: (pc: PitchClass) => void;
  onClear: () => void;
};

export function NoteSelector({ selectedPitchClasses, onToggle, onClear }: NoteSelectorProps) {
  const selectedSet = new Set(selectedPitchClasses);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-sm">構成音を選択</h2>
        {selectedPitchClasses.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-muted text-xs transition-colors hover:text-foreground"
          >
            クリア
          </button>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
        {NOTE_NAMES.map((name, index) => {
          const pc = index as PitchClass;
          const isSelected = selectedSet.has(pc);

          return (
            <button
              key={name}
              type="button"
              onClick={() => onToggle(pc)}
              className={cn(
                "flex h-10 items-center justify-center rounded-lg border font-medium text-sm transition-all",
                isSelected
                  ? "border-chord-root bg-chord-root text-chord-root-fg shadow-sm"
                  : "border-foreground/10 bg-background text-foreground/60 hover:border-foreground/20 hover:text-foreground"
              )}
            >
              {DISPLAY_NOTE_NAMES[index]}
            </button>
          );
        })}
      </div>
    </section>
  );
}
