"use client";

import type { ComponentProps } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FLAT_NOTE_NAMES, NOTE_NAMES, noteNameToPitchClass } from "@/lib/music-theory/note";

export type RootNoteSelectorProps = Omit<ComponentProps<"div">, "onChange"> & {
  value: string;
  onValueChange: (rootName: string) => void;
};

const ROOT_NOTE_OPTIONS = NOTE_NAMES.map((sharpName, i) => {
  const flatName = FLAT_NOTE_NAMES[i];
  const label = sharpName === flatName ? sharpName : `${sharpName}/${flatName}`;
  return { value: sharpName, label };
});

export function RootNoteSelector({
  value,
  onValueChange,
  className,
  ...props
}: RootNoteSelectorProps) {
  const normalizedValue = NOTE_NAMES[noteNameToPitchClass(value)];
  const displayLabel = ROOT_NOTE_OPTIONS.find((o) => o.value === normalizedValue)?.label;

  return (
    <div className={className} {...props}>
      <Select value={normalizedValue} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="選択">{displayLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {ROOT_NOTE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
