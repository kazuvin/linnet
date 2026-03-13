"use client";

import { useMemo } from "react";
import {
  type ChordSearchResult,
  findChordsContainingNotes,
  type PitchClass,
} from "@/lib/music-theory";

type ChordSearchResultsProps = {
  selectedPitchClasses: readonly PitchClass[];
};

type GroupedResults = {
  readonly label: string;
  readonly results: ChordSearchResult[];
};

const TRIAD_QUALITIES = new Set(["major", "minor", "diminished", "augmented", "sus2", "sus4"]);

const SEVENTH_QUALITIES = new Set([
  "dominant7",
  "major7",
  "minor7",
  "minor7b5",
  "diminished7",
  "augmented7",
  "minorMajor7",
  "7sus4",
  "6",
  "minor6",
]);

function groupResults(results: ChordSearchResult[]): GroupedResults[] {
  const triads: ChordSearchResult[] = [];
  const sevenths: ChordSearchResult[] = [];
  const tensions: ChordSearchResult[] = [];

  for (const r of results) {
    if (TRIAD_QUALITIES.has(r.quality)) {
      triads.push(r);
    } else if (SEVENTH_QUALITIES.has(r.quality)) {
      sevenths.push(r);
    } else {
      tensions.push(r);
    }
  }

  const groups: GroupedResults[] = [];
  if (triads.length > 0) groups.push({ label: "トライアド", results: triads });
  if (sevenths.length > 0) groups.push({ label: "7th / 6th", results: sevenths });
  if (tensions.length > 0) groups.push({ label: "テンション", results: tensions });
  return groups;
}

export function ChordSearchResults({ selectedPitchClasses }: ChordSearchResultsProps) {
  const results = useMemo(
    () => findChordsContainingNotes(selectedPitchClasses),
    [selectedPitchClasses]
  );

  const groups = useMemo(() => groupResults(results), [results]);

  if (selectedPitchClasses.length === 0) {
    return <p className="text-center text-muted text-sm">音を選択するとコードが表示されます</p>;
  }

  if (results.length === 0) {
    return <p className="text-center text-muted text-sm">該当するコードが見つかりません</p>;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="font-medium text-sm">検索結果</h2>
        <span className="text-[11px] text-muted">{results.length}件</span>
      </div>
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-2">
          <h3 className="text-muted text-xs">{group.label}</h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {group.results.map((result) => (
              <div
                key={`${result.rootName}-${result.quality}`}
                className="flex h-10 items-center justify-center rounded-lg border border-foreground/10 bg-background font-medium text-sm transition-colors hover:border-foreground/20"
              >
                {result.symbol}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
