"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type SelectedMode, useKeyStore } from "@/features/key-selection/stores/key-store";
import { ALL_MODE_SOURCES, MODE_DISPLAY_NAMES } from "@/lib/music-theory";

type ModeOption = {
  value: SelectedMode;
  label: string;
};

const MODE_OPTIONS: readonly ModeOption[] = [
  { value: "diatonic", label: "Ionian" },
  { value: "secondary-dominant", label: "Sec.Dom" },
  { value: "tritone-substitution", label: "SubV" },
  ...ALL_MODE_SOURCES.map((source) => ({
    value: source as SelectedMode,
    label: MODE_DISPLAY_NAMES[source],
  })),
];

export function ModeSelector() {
  const selectedMode = useKeyStore((s) => s.selectedMode);
  const setSelectedMode = useKeyStore((s) => s.setSelectedMode);

  return (
    <Select value={selectedMode} onValueChange={(value) => setSelectedMode(value as SelectedMode)}>
      <SelectTrigger>
        <SelectValue placeholder="選択">
          {MODE_OPTIONS.find((o) => o.value === selectedMode)?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {MODE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
