"use client";

import { ChordPalette } from "../chord-palette";

type ChordBoardProps = {
  layout?: "row" | "wrap";
};

export function ChordBoard({ layout }: ChordBoardProps) {
  return (
    <section className="flex flex-col gap-6">
      <ChordPalette layout={layout} />
    </section>
  );
}
