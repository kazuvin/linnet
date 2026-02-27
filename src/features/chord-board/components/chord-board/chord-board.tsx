"use client";

import { ChordPalette } from "../chord-palette";

export function ChordBoard() {
  return (
    <section className="flex flex-col gap-6">
      <ChordPalette />
    </section>
  );
}
