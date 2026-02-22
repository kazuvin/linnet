"use client";

import type { ComponentProps } from "react";
import { Select, type SelectOption } from "@/components/ui/select";

export type ChordTypeSelectorProps = Omit<ComponentProps<"div">, "onChange"> & {
  value: "triad" | "seventh";
  onValueChange: (chordType: "triad" | "seventh") => void;
};

const CHORD_TYPE_OPTIONS: readonly SelectOption[] = [
  { value: "triad", label: "Triad" },
  { value: "seventh", label: "Seventh" },
];

export function ChordTypeSelector({
  value,
  onValueChange,
  className,
  ...props
}: ChordTypeSelectorProps) {
  return (
    <div className={className} {...props}>
      <Select
        value={value}
        onValueChange={(v) => onValueChange(v as "triad" | "seventh")}
        options={CHORD_TYPE_OPTIONS}
      />
    </div>
  );
}
