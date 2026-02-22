"use client";

import type { ComponentProps } from "react";
import { Select } from "@/components/ui/select";
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
  // Normalize flat names to sharp names for the Select value
  const normalizedValue = NOTE_NAMES[noteNameToPitchClass(value)];

  return (
    <div className={className} {...props}>
      <Select value={normalizedValue} onValueChange={onValueChange} options={ROOT_NOTE_OPTIONS} />
    </div>
  );
}
