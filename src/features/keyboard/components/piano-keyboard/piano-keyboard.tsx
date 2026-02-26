import { useMemo } from "react";
import type { NoteRole, OverlayPosition, PitchClass } from "@/lib/music-theory";
import { cn } from "@/lib/utils";
import { deriveKeyboardNotes, type KeyboardNoteInfo } from "../../lib/keyboard-notes";

/** 1オクターブ内の白鍵のピッチクラス */
const WHITE_KEY_PITCH_CLASSES: PitchClass[] = [0, 2, 4, 5, 7, 9, 11];

/** 1オクターブ内の黒鍵の定義（ピッチクラスと白鍵基準の左オフセット） */
const BLACK_KEY_DEFS: { pitchClass: PitchClass; whiteKeyOffset: number }[] = [
  { pitchClass: 1, whiteKeyOffset: 0.65 },
  { pitchClass: 3, whiteKeyOffset: 1.65 },
  { pitchClass: 6, whiteKeyOffset: 3.6 },
  { pitchClass: 8, whiteKeyOffset: 4.6 },
  { pitchClass: 10, whiteKeyOffset: 5.6 },
];

const NUM_OCTAVES = 2;
const WHITE_KEYS_PER_OCTAVE = 7;
const TOTAL_WHITE_KEYS = NUM_OCTAVES * WHITE_KEYS_PER_OCTAVE;
const BLACK_KEY_WIDTH_RATIO = 0.6;

const NOTE_ROLE_STYLES: Record<NoteRole, { white: string; black: string }> = {
  "chord-root": {
    white: "bg-chord-root text-chord-root-fg",
    black: "bg-chord-root text-chord-root-fg",
  },
  "chord-tone": {
    white: "bg-chord-tone text-chord-tone-fg",
    black: "bg-chord-tone text-chord-tone-fg",
  },
  scale: {
    white: "bg-scale-tone text-scale-tone-fg",
    black: "bg-scale-tone/80 text-scale-tone-fg",
  },
};

type PianoKeyboardProps = {
  positions: readonly OverlayPosition[];
  showCharacteristicNotes: boolean;
  showAvoidNotes: boolean;
};

export function PianoKeyboard({
  positions,
  showCharacteristicNotes,
  showAvoidNotes,
}: PianoKeyboardProps) {
  const noteMap = useMemo(() => deriveKeyboardNotes(positions), [positions]);

  return (
    <div className="overflow-x-auto pb-1">
      <div
        className="relative mx-auto"
        style={{
          width: "100%",
          maxWidth: "48rem",
          height: "10rem",
        }}
      >
        {/* 白鍵 */}
        <div className="flex h-full">
          {Array.from({ length: TOTAL_WHITE_KEYS }, (_, i) => {
            const octave = Math.floor(i / WHITE_KEYS_PER_OCTAVE);
            const keyIndex = i % WHITE_KEYS_PER_OCTAVE;
            const pitchClass = WHITE_KEY_PITCH_CLASSES[keyIndex];
            const noteInfo = noteMap.get(pitchClass);

            return (
              <WhiteKey
                key={`w-${octave}-${pitchClass}`}
                noteInfo={noteInfo}
                showCharacteristicNotes={showCharacteristicNotes}
                showAvoidNotes={showAvoidNotes}
              />
            );
          })}
        </div>

        {/* 黒鍵 */}
        {Array.from({ length: NUM_OCTAVES }, (_, octave) =>
          BLACK_KEY_DEFS.map(({ pitchClass, whiteKeyOffset }) => {
            const left =
              ((octave * WHITE_KEYS_PER_OCTAVE + whiteKeyOffset) / TOTAL_WHITE_KEYS) * 100;
            const width = (BLACK_KEY_WIDTH_RATIO / TOTAL_WHITE_KEYS) * 100;
            const noteInfo = noteMap.get(pitchClass);

            return (
              <BlackKey
                key={`b-${octave}-${pitchClass}`}
                left={left}
                width={width}
                noteInfo={noteInfo}
                showCharacteristicNotes={showCharacteristicNotes}
                showAvoidNotes={showAvoidNotes}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

function WhiteKey({
  noteInfo,
  showCharacteristicNotes,
  showAvoidNotes,
}: {
  noteInfo: KeyboardNoteInfo | undefined;
  showCharacteristicNotes: boolean;
  showAvoidNotes: boolean;
}) {
  const isHighlighted = !!noteInfo;
  const isAvoid = isHighlighted && showAvoidNotes && noteInfo.isAvoid;
  const isCharacteristic = isHighlighted && showCharacteristicNotes && noteInfo.isCharacteristic;

  return (
    <div
      className={cn(
        "relative flex flex-1 flex-col items-center justify-end border-foreground/15 border-r pb-2",
        "rounded-b-md transition-colors duration-[120ms] ease-out",
        isAvoid
          ? "bg-avoid-note text-avoid-note-fg"
          : isHighlighted
            ? NOTE_ROLE_STYLES[noteInfo.role].white
            : "bg-card text-muted",
        isCharacteristic && "ring-2 ring-foreground/40 ring-inset"
      )}
    >
      {isHighlighted && (
        <span className="font-bold font-mono text-[11px]">{noteInfo.noteName}</span>
      )}
    </div>
  );
}

function BlackKey({
  left,
  width,
  noteInfo,
  showCharacteristicNotes,
  showAvoidNotes,
}: {
  left: number;
  width: number;
  noteInfo: KeyboardNoteInfo | undefined;
  showCharacteristicNotes: boolean;
  showAvoidNotes: boolean;
}) {
  const isHighlighted = !!noteInfo;
  const isAvoid = isHighlighted && showAvoidNotes && noteInfo.isAvoid;
  const isCharacteristic = isHighlighted && showCharacteristicNotes && noteInfo.isCharacteristic;

  return (
    <div
      className={cn(
        "absolute top-0 z-10 flex flex-col items-center justify-end pb-2",
        "rounded-b-md transition-colors duration-[120ms] ease-out",
        isAvoid
          ? "bg-avoid-note text-avoid-note-fg"
          : isHighlighted
            ? NOTE_ROLE_STYLES[noteInfo.role].black
            : "bg-foreground/85 text-background/60",
        isCharacteristic && "ring-2 ring-background/60 ring-inset"
      )}
      style={{
        left: `${left}%`,
        width: `${width}%`,
        height: "62%",
      }}
    >
      {isHighlighted && <span className="font-bold font-mono text-[9px]">{noteInfo.noteName}</span>}
    </div>
  );
}
