"use client";

import { Card } from "@/components";
import { ChordSelector, ScaleCard, useChordScaleData, VoicingCard } from "./chord-scale-lookup";

export function ChordScalePageContent() {
  const data = useChordScaleData();

  return (
    <>
      <ChordSelector data={data} />
      <Card>
        <ScaleCard data={data} />
      </Card>
      <Card>
        <VoicingCard data={data} />
      </Card>
    </>
  );
}
