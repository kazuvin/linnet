"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setSelectedMode, useKeySnapshot } from "@/features/key-selection/stores/key-store";
import { ALL_MODE_SOURCES, MODE_DISPLAY_NAMES, type ScaleType } from "@/lib/music-theory";

type ModeOption = {
  value: "diatonic" | "secondary-dominant" | ScaleType;
  label: string;
};

const MODE_OPTIONS: readonly ModeOption[] = [
  { value: "diatonic", label: "Ionian" },
  { value: "secondary-dominant", label: "Sec.Dom" },
  ...ALL_MODE_SOURCES.map((source) => ({
    value: source as ScaleType,
    label: MODE_DISPLAY_NAMES[source],
  })),
];

export function ModeSelector() {
  const { selectedMode } = useKeySnapshot();

  return (
    <Select
      value={selectedMode}
      onValueChange={(value) =>
        setSelectedMode(value as "diatonic" | "secondary-dominant" | ScaleType)
      }
    >
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
