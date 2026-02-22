"use client";

import type { ComponentProps } from "react";
import { useModalInterchangeChordsByMode } from "@/features/key-selection/stores/key-store";
import { cn } from "@/lib/utils";
import { ModalInterchangeModeSection } from "../modal-interchange-mode-section";

export type ModalInterchangeChordListProps = ComponentProps<"section">;

export function ModalInterchangeChordList({ className, ...props }: ModalInterchangeChordListProps) {
  const modeGroups = useModalInterchangeChordsByMode();

  return (
    <section className={cn("flex flex-col gap-8", className)} {...props}>
      <h2 className="font-bold text-lg">Modal Interchange</h2>
      {modeGroups.map((modeGroup) => (
        <ModalInterchangeModeSection key={modeGroup.source} modeGroup={modeGroup} />
      ))}
    </section>
  );
}
