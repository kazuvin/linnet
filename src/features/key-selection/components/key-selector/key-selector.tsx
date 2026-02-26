"use client";

import type { ComponentProps } from "react";
import { Label } from "@/components/ui/label";
import { changeKey } from "@/features/store-coordination";
import { cn } from "@/lib/utils";
import { useKeyStore } from "../../stores/key-store";
import { RootNoteSelector } from "../root-note-selector";

export type KeySelectorProps = ComponentProps<"div">;

export function KeySelector({ className, ...props }: KeySelectorProps) {
  const rootName = useKeyStore((s) => s.rootName);

  return (
    <div className={cn("flex items-center gap-6", className)} {...props}>
      <div className="flex items-center gap-2">
        <Label className="font-semibold">Key</Label>
        <RootNoteSelector value={rootName} onValueChange={changeKey} />
      </div>
    </div>
  );
}
