import type { RefObject } from "react";
import { PlaybackControls } from "@/features/chord-playback/components/playback-controls";
import { useChordPlaybackStore } from "@/features/chord-playback/stores/chord-playback-store";
import { useChordProgressionStore } from "@/features/chord-progression/stores/chord-progression-store";
import { selectProgressionChord } from "@/features/store-coordination";
import { playChord } from "@/lib/audio/chord-player";
import { cn } from "@/lib/utils";
import type { useNativeDnd } from "../../hooks/use-native-dnd";
import { ChordCard } from "../chord-card";

type ProgressionLaneProps = {
  containerRef: RefObject<HTMLDivElement | null>;
  containerDropHandlers: ReturnType<typeof useNativeDnd>["containerDropHandlers"];
  createDragHandlers: ReturnType<typeof useNativeDnd>["createProgressionDragHandlers"];
  createDropZoneHandlers: ReturnType<typeof useNativeDnd>["createDropZoneHandlers"];
};

export function ProgressionLane({
  containerRef,
  containerDropHandlers,
  createDragHandlers,
  createDropZoneHandlers,
}: ProgressionLaneProps) {
  const { chords, selectedChordId, clearProgression, removeChord } = useChordProgressionStore();

  async function handlePlayProgression() {
    if (chords.length === 0 || useChordPlaybackStore.getState().isMuted) return;
    useChordPlaybackStore.getState().setPlaying(true);
    try {
      for (const chord of chords) {
        if (useChordPlaybackStore.getState().isMuted) break;
        await playChord(chord.rootName, chord.quality);
      }
    } finally {
      useChordPlaybackStore.getState().setPlaying(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-lg">Progression</h2>
          <PlaybackControls onPlay={handlePlayProgression} disabled={chords.length === 0} />
        </div>
        {chords.length > 0 && (
          <button
            type="button"
            className="rounded-full px-3 py-1.5 text-muted text-sm transition-colors hover:bg-foreground/5 hover:text-foreground"
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
              const progressionHandlers = createDragHandlers(index);
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
                      selectProgressionChord(isDeselecting ? null : chord.id);
                      if (!isDeselecting && !useChordPlaybackStore.getState().isMuted) {
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
  );
}
