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
          <SelectValue placeholder="選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="triad">Triad</SelectItem>
          <SelectItem value="seventh">Seventh</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
