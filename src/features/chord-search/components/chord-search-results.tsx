"use client";

import { useMemo } from "react";
import {
  type ChordQuality,
  type ClassifiedChordSearchResult,
  classifyChordSearchResults,
  findChordsContainingNotes,
  type PitchClass,
} from "@/lib/music-theory";
import { cn } from "@/lib/utils";

type ChordSearchResultsProps = {
  selectedPitchClasses: readonly PitchClass[];
  bassPitchClass: PitchClass | undefined;
  selectedChord: { rootName: string; quality: ChordQuality } | null;
  onSelectChord: (rootName: string, quality: ChordQuality) => void;
};

type GroupedResults = {
  readonly label: string;
  readonly results: ClassifiedChordSearchResult[];
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

function groupResults(results: ClassifiedChordSearchResult[]): GroupedResults[] {
  const triads: ClassifiedChordSearchResult[] = [];
  const sevenths: ClassifiedChordSearchResult[] = [];
  const tensions: ClassifiedChordSearchResult[] = [];

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

function ChordSearchCard({
  result,
  isActive,
  onClick,
}: {
  result: ClassifiedChordSearchResult;
  isActive: boolean;
  onClick: () => void;
}) {
  const isInversion = !!result.bassNoteName;

  return (
    <button
      type="button"
      className={cn(
        "flex aspect-square flex-col items-center justify-center rounded-sm border shadow-card transition-all duration-150 hover:shadow-card-hover active:scale-90 active:shadow-inner lg:rounded-2xl",
        "cursor-pointer select-none gap-0.5 overflow-hidden",
        isActive ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : "",
        isInversion
          ? "border-foreground/10 bg-muted/30 text-foreground/70 hover:border-foreground/20"
          : "border-foreground/10 bg-background text-foreground hover:border-foreground/20"
      )}
      onClick={onClick}
    >
      <span className="font-bold text-[10px] lg:text-base">{result.symbol}</span>
      {isInversion && <span className="text-[7px] text-muted lg:text-[10px]">転回形</span>}
    </button>
  );
}

export function ChordSearchResults({
  selectedPitchClasses,
  bassPitchClass,
  selectedChord,
  onSelectChord,
}: ChordSearchResultsProps) {
  const results = useMemo(
    () => findChordsContainingNotes(selectedPitchClasses),
    [selectedPitchClasses]
  );

  const classified = useMemo(
    () => classifyChordSearchResults(results, bassPitchClass),
    [results, bassPitchClass]
  );

  const rootGroups = useMemo(
    () => groupResults(classified.rootPosition),
    [classified.rootPosition]
  );
  const inversionGroups = useMemo(
    () => groupResults(classified.inversions),
    [classified.inversions]
  );

  if (selectedPitchClasses.length === 0) {
    return <p className="text-center text-muted text-sm">音を選択するとコードが表示されます</p>;
  }

  if (results.length === 0) {
    return <p className="text-center text-muted text-sm">該当するコードが見つかりません</p>;
  }

  const totalCount = classified.rootPosition.length + classified.inversions.length;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="font-medium text-sm">検索結果</h2>
        <span className="text-[11px] text-muted">{totalCount}件</span>
      </div>

      {rootGroups.length > 0 && (
        <div className="flex flex-col gap-4">
          {bassPitchClass !== undefined && classified.inversions.length > 0 && (
            <h3 className="font-medium text-foreground/80 text-xs">ルートポジション</h3>
          )}
          {rootGroups.map((group) => (
            <div key={group.label} className="flex flex-col gap-2">
              <h3 className="text-muted text-xs">{group.label}</h3>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {group.results.map((result) => {
                  const isActive =
                    selectedChord?.rootName === result.rootName &&
                    selectedChord?.quality === result.quality;
                  return (
                    <ChordSearchCard
                      key={`${result.rootName}-${result.quality}`}
                      result={result}
                      isActive={isActive}
                      onClick={() => onSelectChord(result.rootName, result.quality)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {inversionGroups.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="font-medium text-foreground/80 text-xs">転回形</h3>
          {inversionGroups.map((group) => (
            <div key={`inv-${group.label}`} className="flex flex-col gap-2">
              <h3 className="text-muted text-xs">{group.label}</h3>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {group.results.map((result) => {
                  const isActive =
                    selectedChord?.rootName === result.rootName &&
                    selectedChord?.quality === result.quality;
                  return (
                    <ChordSearchCard
                      key={`inv-${result.rootName}-${result.quality}`}
                      result={result}
                      isActive={isActive}
                      onClick={() => onSelectChord(result.rootName, result.quality)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
