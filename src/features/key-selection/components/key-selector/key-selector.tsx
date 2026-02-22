"use client";

import type { ComponentProps } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { setChordType, setRootName, useKeySnapshot } from "../../stores/key-store";
import { ChordTypeSelector } from "../chord-type-selector";
import { RootNoteSelector } from "../root-note-selector";

export type KeySelectorProps = ComponentProps<"div">;

export function KeySelector({ className, ...props }: KeySelectorProps) {
  const { rootName, chordType } = useKeySnapshot();

  return (
    <div className={cn("flex items-center gap-6", className)} {...props}>
      <div className="flex items-center gap-2">
        <Label className="font-semibold">Key</Label>
        <RootNoteSelector value={rootName} onValueChange={setRootName} />
        <ChordTypeSelector value={chordType} onValueChange={setChordType} />
      </div>
    </div>
  );
}
