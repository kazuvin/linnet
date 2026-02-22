"use client";

import type { ComponentProps } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ChordTypeSelectorProps = Omit<ComponentProps<"div">, "onChange"> & {
  value: "triad" | "seventh";
  onValueChange: (chordType: "triad" | "seventh") => void;
};

const CHORD_TYPE_LABELS: Record<string, string> = {
  triad: "Triad",
  seventh: "Seventh",
};

export function ChordTypeSelector({
  value,
  onValueChange,
  className,
  ...props
}: ChordTypeSelectorProps) {
  return (
    <div className={className} {...props}>
      <Select value={value} onValueChange={(v) => onValueChange(v as "triad" | "seventh")}>
        <SelectTrigger>
          <SelectValue placeholder="選択">{CHORD_TYPE_LABELS[value]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="triad">Triad</SelectItem>
          <SelectItem value="seventh">Seventh</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
