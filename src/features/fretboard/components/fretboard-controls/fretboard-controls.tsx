"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFretboardStore } from "@/features/fretboard/stores/fretboard-store";

type FretboardControlsProps = {
  maxFret: number;
};

const MAX_FRET_OPTIONS = [12, 15, 19, 22, 24] as const;

export function FretboardControls({ maxFret }: FretboardControlsProps) {
  const setMaxFret = useFretboardStore((s) => s.setMaxFret);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Max fret selector */}
      <Select value={String(maxFret)} onValueChange={(v) => setMaxFret(Number(v))}>
        <SelectTrigger>
          <SelectValue>{maxFret} フレット</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {MAX_FRET_OPTIONS.map((fret) => (
            <SelectItem key={fret} value={String(fret)}>
              {fret} フレット
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
