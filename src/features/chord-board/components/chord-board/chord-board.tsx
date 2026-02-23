"use client";

import { PlaybackControls } from "@/features/chord-playback/components/playback-controls";
import { getIsMuted, setPlaying } from "@/features/chord-playback/stores/chord-playback-store";
import {
  addChord,
  clearProgression,
  removeChord,
  selectChord,
  useChordProgressionSnapshot,
} from "@/features/chord-progression/stores/chord-progression-store";
import { ChordTypeSelector } from "@/features/key-selection/components/chord-type-selector";
import {
  setChordType,
  useCurrentModeChords,
  useKeySnapshot,
} from "@/features/key-selection/stores/key-store";
import { playChord } from "@/lib/audio/chord-player";
import { cn } from "@/lib/utils";
import { useFlipAnimation } from "../../hooks/use-flip-animation";
import { useNativeDnd } from "../../hooks/use-native-dnd";
import { ChordCard } from "../chord-card";
import { ModeSelector } from "../mode-selector";

export function ChordBoard() {
  const paletteChords = useCurrentModeChords();
  const { selectedMode, chordType } = useKeySnapshot();
  const { chords, selectedChordId } = useChordProgressionSnapshot();

  const chordKeys = chords.map((c) => c.id);
  const { containerRef, capturePositions } = useFlipAnimation(chordKeys);
  const {
    createPaletteDragHandlers,
    createProgressionDragHandlers,
    createDropZoneHandlers,
    containerDropHandlers,
  } = useNativeDnd({
    onBeforeReorder: capturePositions,
    chordsCount: chords.length,
    containerRef,
  });

  function getEffectiveSource(chordInfo: (typeof paletteChords)[number]) {
    return (chordInfo.source ?? selectedMode) as Exclude<typeof selectedMode, `category:${string}`>;
  }

  function handlePaletteClick(chordInfo: (typeof paletteChords)[number]) {
    addChord(
      chordInfo.chord.root.name,
      chordInfo.chord.quality,
      getEffectiveSource(chordInfo),
      chordInfo.chordFunction,
      chordInfo.romanNumeral,
      chordInfo.degree
    );
    if (!getIsMuted()) {
      playChord(chordInfo.chord.root.name, chordInfo.chord.quality);
    }
  }

  async function handlePlayProgression() {
    if (chords.length === 0 || getIsMuted()) return;
    setPlaying(true);
    try {
      for (const chord of chords) {
        if (getIsMuted()) break;
        await playChord(chord.rootName, chord.quality, { duration: "2n" });
        await new Promise((resolve) => setTimeout(resolve, 700));
      }
    } finally {
      setPlaying(false);
    }
  }

  return (
    <section className="flex flex-col gap-6">
      {/* Palette */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-lg">Chords</h2>
          <div className="flex items-center gap-2">
            <ModeSelector />
            <ChordTypeSelector value={chordType} onValueChange={setChordType} />
          </div>
        </div>
        <div className="-mx-4 grid auto-cols-[6rem] grid-flow-col gap-2 overflow-x-auto px-4 pb-2">
          {paletteChords.map((chordInfo) => {
            const source = getEffectiveSource(chordInfo);
            return (
              <ChordCard
                key={`${chordInfo.degree}-${chordInfo.chord.symbol}-${source}`}
                chord={{
                  romanNumeral: chordInfo.romanNumeral,
                  symbol: chordInfo.chord.symbol,
                  chordFunction: chordInfo.chordFunction,
                  source,
                }}
                onClick={() => handlePaletteClick(chordInfo)}
                {...createPaletteDragHandlers({
                  rootName: chordInfo.chord.root.name,
                  quality: chordInfo.chord.quality,
                  source,
                  chordFunction: chordInfo.chordFunction,
                  romanNumeral: chordInfo.romanNumeral,
                  degree: chordInfo.degree,
                })}
              />
            );
          })}
        </div>
      </div>

      {/* Progression */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg">Progression</h2>
            <PlaybackControls onPlay={handlePlayProgression} disabled={chords.length === 0} />
          </div>
          {chords.length > 0 && (
            <button
              type="button"
              className="text-muted text-sm transition-colors hover:text-foreground"
              onClick={clearProgression}
            >
              Clear
            </button>
          )}
        </div>
        <div className="min-h-20">
          <div
            ref={containerRef}
            className={cn(
              "min-h-14 overflow-x-auto pt-2 pr-2 pb-1",
              chords.length > 0
                ? "grid auto-cols-[6rem] grid-flow-col gap-2"
                : "flex items-center justify-center"
            )}
            {...containerDropHandlers}
          >
            {chords.length === 0 && (
              <span className="text-muted text-sm">コードをクリックまたはドラッグして追加</span>
            )}
            {chords.length > 0 &&
              chords.map((chord, index) => {
                const progressionHandlers = createProgressionDragHandlers(index);
                return (
                  <div key={chord.id} data-flip-key={chord.id} {...createDropZoneHandlers(index)}>
                    <ChordCard
                      chord={{
                        romanNumeral: chord.romanNumeral,
                        symbol: chord.symbol,
                        chordFunction: chord.chordFunction,
                        source: chord.source,
                      }}
                      isSelected={chord.id === selectedChordId}
                      onRemove={() => removeChord(chord.id)}
                      onClick={() => {
                        const isDeselecting = chord.id === selectedChordId;
                        selectChord(isDeselecting ? null : chord.id);
                        if (!isDeselecting && !getIsMuted()) {
                          playChord(chord.rootName, chord.quality);
                        }
                      }}
                      draggable={progressionHandlers.draggable}
                      onDragStart={(e) => {
                        progressionHandlers.onDragStart(e);
                        const el = e.currentTarget as HTMLElement;
                        requestAnimationFrame(() => {
                          el.style.visibility = "hidden";
                        });
                      }}
                      onDragEnd={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.visibility = "";
                        progressionHandlers.onDragEnd(e);
                      }}
                    />
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </section>
  );
}
