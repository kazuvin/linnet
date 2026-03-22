"use client";

import { useChordPlaybackStore } from "@/features/chord-playback/stores/chord-playback-store";
import { useChordProgressionStore } from "@/features/chord-progression/stores/chord-progression-store";
import type { PaletteChordInfo } from "@/features/key-selection/stores/key-selectors";
import { useCurrentModeChordsAllByDegree } from "@/features/key-selection/stores/key-selectors";
import { useKeyStore } from "@/features/key-selection/stores/key-store";
import { selectChordFromPalette } from "@/features/store-coordination";
import { playChord } from "@/lib/audio/chord-player";
import type { ChordFunction, ChordSource } from "@/lib/music-theory";
import { cn } from "@/lib/utils";

const CARD_BG_STYLES: Record<ChordFunction, string> = {
  tonic: "bg-tonic text-tonic-foreground border-transparent",
  subdominant: "bg-subdominant text-subdominant-foreground border-transparent",
  dominant: "bg-dominant text-dominant-foreground border-transparent",
};

const FUNCTION_LABEL: Record<ChordFunction, string> = {
  tonic: "T",
  subdominant: "SD",
  dominant: "D",
};

export function ScaleChordResults() {
  const degreeGroups = useCurrentModeChordsAllByDegree();
  const selectedMode = useKeyStore((s) => s.selectedMode);
  const activeChordOverride = useChordProgressionStore((s) => s.activeChordOverride);

  const totalCount = degreeGroups.reduce((sum, g) => sum + g.chords.length, 0);

  function handleClick(chordInfo: PaletteChordInfo) {
    const source = (chordInfo.source ?? selectedMode) as ChordSource;
    const gridChord = {
      rootName: chordInfo.chord.root.name,
      quality: chordInfo.chord.quality,
      symbol: chordInfo.chord.symbol,
      source,
      chordFunction: chordInfo.chordFunction,
      romanNumeral: chordInfo.romanNumeral,
      degree: chordInfo.degree,
    };
    selectChordFromPalette(gridChord);
    if (!useChordPlaybackStore.getState().isMuted) {
      playChord(gridChord.rootName, gridChord.quality);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-medium text-sm">検索結果</h2>
        <span className="text-[11px] text-muted">{totalCount}件</span>
      </div>
      <div className="flex flex-col gap-3">
        {degreeGroups.map((group) => (
          <div key={group.degree} className="flex flex-col gap-1.5">
            <span className="font-medium text-muted text-xs">{group.degree}度</span>
            <div className="grid grid-cols-4 gap-2 md:grid-cols-6 lg:grid-cols-8">
              {group.chords.map((chordInfo) => {
                const source = (chordInfo.source ?? selectedMode) as ChordSource;
                const isActive =
                  activeChordOverride?.rootName === chordInfo.chord.root.name &&
                  activeChordOverride?.quality === chordInfo.chord.quality &&
                  activeChordOverride?.source === source;

                return (
                  <button
                    key={`${chordInfo.degree}-${chordInfo.chord.symbol}-${source}`}
                    type="button"
                    className={cn(
                      "flex aspect-square flex-col items-center justify-center rounded-sm border shadow-card transition-colors duration-150 hover:shadow-card-hover active:scale-90 active:shadow-inner lg:rounded-2xl",
                      "cursor-pointer select-none gap-0.5 overflow-hidden",
                      isActive ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : "",
                      CARD_BG_STYLES[chordInfo.chordFunction]
                    )}
                    onClick={() => handleClick(chordInfo)}
                  >
                    <span className="font-bold text-[10px] lg:text-base">
                      {chordInfo.chord.symbol}
                    </span>
                    <span className="text-[7px] opacity-70 lg:text-[10px]">
                      {FUNCTION_LABEL[chordInfo.chordFunction]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
