import { getIsMuted } from "@/features/chord-playback/stores/chord-playback-store";
import { addChord } from "@/features/chord-progression/stores/chord-progression-store";
import { ChordTypeSelector } from "@/features/key-selection/components/chord-type-selector";
import {
  setChordType,
  useCurrentModeChords,
  useKeySnapshot,
} from "@/features/key-selection/stores/key-store";
import { playChord } from "@/lib/audio/chord-player";
import type { useNativeDnd } from "../../hooks/use-native-dnd";
import { ChordCard } from "../chord-card";
import { ModeSelector } from "../mode-selector";

type ChordPaletteProps = {
  createDragHandlers: ReturnType<typeof useNativeDnd>["createPaletteDragHandlers"];
};

export function ChordPalette({ createDragHandlers }: ChordPaletteProps) {
  const paletteChords = useCurrentModeChords();
  const { selectedMode, chordType } = useKeySnapshot();

  function getEffectiveSource(chordInfo: (typeof paletteChords)[number]) {
    return (chordInfo.source ?? selectedMode) as Exclude<typeof selectedMode, `category:${string}`>;
  }

  function handleClick(chordInfo: (typeof paletteChords)[number]) {
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

  return (
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
              onClick={() => handleClick(chordInfo)}
              {...createDragHandlers({
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
  );
}
