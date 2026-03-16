"use client";

import { useMemo, useState } from "react";
import { PlayIcon, StopIcon } from "@/components/icons";
import { AnimatedText } from "@/components/ui/animated-text";
import { IconButton } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabNav, TabNavItem } from "@/components/ui/tab-nav";
import { FretboardGrid, FretboardLegend, VoicingGrid } from "@/features/fretboard/components";
import type { InstrumentTab } from "@/features/fretboard/stores/fretboard-store";
import { MAX_FRET, useFretboardStore } from "@/features/fretboard/stores/fretboard-store";
import { RootNoteSelector } from "@/features/key-selection/components/root-note-selector";
import { PianoKeyboard } from "@/features/keyboard/components";
import { playScale, stopScale } from "@/lib/audio/scale-player";
import {
  type ChordQuality,
  findChordPositions,
  findOverlayPositions,
  findScalesForChord,
  formatChordSymbol,
  type ScaleType,
} from "@/lib/music-theory";
import { useChordScaleLookupStore } from "../stores/chord-scale-lookup-store";

type QualityGroup = {
  readonly label: string;
  readonly options: readonly { value: ChordQuality; label: string }[];
};

const QUALITY_GROUPS: readonly QualityGroup[] = [
  {
    label: "トライアド",
    options: [
      { value: "major", label: "Major" },
      { value: "minor", label: "Minor" },
      { value: "diminished", label: "dim" },
      { value: "augmented", label: "aug" },
      { value: "sus2", label: "sus2" },
      { value: "sus4", label: "sus4" },
    ],
  },
  {
    label: "7th",
    options: [
      { value: "dominant7", label: "7" },
      { value: "major7", label: "M7" },
      { value: "minor7", label: "m7" },
      { value: "minor7b5", label: "m7(b5)" },
      { value: "diminished7", label: "dim7" },
      { value: "augmented7", label: "aug7" },
      { value: "minorMajor7", label: "mM7" },
      { value: "7sus4", label: "7sus4" },
    ],
  },
  {
    label: "6th",
    options: [
      { value: "6", label: "6" },
      { value: "minor6", label: "m6" },
    ],
  },
  {
    label: "テンション",
    options: [
      { value: "add9", label: "add9" },
      { value: "dominant9", label: "9" },
      { value: "major9", label: "M9" },
      { value: "minor9", label: "m9" },
      { value: "dominant7sharp9", label: "7(#9)" },
      { value: "dominant7flat9", label: "7(b9)" },
    ],
  },
];

const ALL_QUALITY_OPTIONS = QUALITY_GROUPS.flatMap((g) => g.options);

/** ストアから読み取り、重い計算を1回だけ実行するフック */
export function useChordScaleData() {
  const { rootName, quality, selectedScaleType, setRootName, setQuality, setSelectedScaleType } =
    useChordScaleLookupStore();
  const { showCharacteristicNotes, showAvoidNotes, activeInstrument, setActiveInstrument } =
    useFretboardStore();

  const chordSymbol = formatChordSymbol(rootName, quality);

  const availableScales = useMemo(() => findScalesForChord(rootName, quality), [rootName, quality]);

  const activeScaleType = useMemo(() => {
    if (selectedScaleType !== null) {
      if (availableScales.some((s) => s.scaleType === selectedScaleType)) {
        return selectedScaleType;
      }
    }
    return availableScales.length > 0 ? availableScales[0].scaleType : null;
  }, [selectedScaleType, availableScales]);

  const positions = useMemo(() => {
    if (!activeScaleType) return [];
    return findOverlayPositions(rootName, activeScaleType, rootName, quality);
  }, [rootName, quality, activeScaleType]);

  const voicings = useMemo(() => findChordPositions(rootName, quality), [rootName, quality]);

  return {
    rootName,
    quality,
    selectedScaleType,
    setRootName,
    setQuality,
    setSelectedScaleType,
    showCharacteristicNotes,
    showAvoidNotes,
    activeInstrument,
    setActiveInstrument,
    chordSymbol,
    availableScales,
    activeScaleType,
    positions,
    voicings,
  };
}

type ChordScaleData = ReturnType<typeof useChordScaleData>;

/** コードセレクター */
export function ChordSelector({
  data,
}: {
  data: Pick<ChordScaleData, "rootName" | "quality" | "chordSymbol" | "setRootName" | "setQuality">;
}) {
  const { rootName, quality, chordSymbol, setRootName, setQuality } = data;

  return (
    <section className="flex flex-col items-center gap-4">
      <AnimatedText text={chordSymbol} className="font-bold text-5xl tracking-tight lg:text-6xl" />
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="shrink-0 font-medium text-muted text-sm">コード</span>
        <RootNoteSelector value={rootName} onValueChange={setRootName} />
        <Select value={quality} onValueChange={(v) => setQuality(v as ChordQuality)}>
          <SelectTrigger>
            <SelectValue>{ALL_QUALITY_OPTIONS.find((o) => o.value === quality)?.label}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {QUALITY_GROUPS.map((group) => (
              <SelectGroup key={group.label}>
                <SelectLabel>{group.label}</SelectLabel>
                {group.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}

/** スケール＋フレットボード/鍵盤カード */
export function ScaleCard({
  data,
}: {
  data: Pick<
    ChordScaleData,
    | "rootName"
    | "chordSymbol"
    | "availableScales"
    | "activeScaleType"
    | "positions"
    | "showCharacteristicNotes"
    | "showAvoidNotes"
    | "activeInstrument"
    | "setActiveInstrument"
    | "setSelectedScaleType"
  >;
}) {
  const {
    rootName,
    chordSymbol,
    availableScales,
    activeScaleType,
    positions,
    showCharacteristicNotes,
    showAvoidNotes,
    activeInstrument,
    setActiveInstrument,
    setSelectedScaleType,
  } = data;

  const [playingScaleType, setPlayingScaleType] = useState<ScaleType | null>(null);

  const handlePlayScale = async () => {
    if (!activeScaleType) return;
    if (playingScaleType === activeScaleType) {
      stopScale();
      setPlayingScaleType(null);
      return;
    }
    setPlayingScaleType(activeScaleType);
    try {
      await playScale(rootName, activeScaleType);
    } finally {
      setPlayingScaleType(null);
    }
  };

  const isPlaying = playingScaleType !== null && playingScaleType === activeScaleType;

  const activeScaleDisplayName = availableScales.find(
    (s) => s.scaleType === activeScaleType
  )?.displayName;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <TabNav
          value={activeInstrument}
          onValueChange={(v) => setActiveInstrument(v as InstrumentTab)}
        >
          <TabNavItem value="fretboard">フレットボード</TabNavItem>
          <TabNavItem value="keyboard">鍵盤</TabNavItem>
        </TabNav>
        {/* スケール選択 */}
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-muted text-sm">
            <span className="font-bold text-foreground">{chordSymbol}</span> スケール
          </span>
          <Select
            value={activeScaleType ?? "__none__"}
            onValueChange={(v) => setSelectedScaleType(v === "__none__" ? null : (v as ScaleType))}
            disabled={availableScales.length === 0}
          >
            <SelectTrigger>
              <SelectValue>
                {activeScaleType && activeScaleDisplayName
                  ? `${rootName} ${activeScaleDisplayName}`
                  : "---"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableScales.map((scale) => (
                <SelectItem key={scale.scaleType} value={scale.scaleType}>
                  {rootName} {scale.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeScaleType && (
            <IconButton
              className={
                isPlaying ? "bg-foreground text-background hover:bg-foreground" : undefined
              }
              onClick={handlePlayScale}
              aria-label={isPlaying ? "スケール再生を停止" : "スケールを再生"}
              title={isPlaying ? "スケール再生を停止" : "スケールを再生"}
            >
              {isPlaying ? <StopIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
            </IconButton>
          )}
        </div>
      </div>

      {/* フレットボード / 鍵盤 */}
      {activeInstrument === "fretboard" ? (
        <FretboardGrid
          positions={positions}
          maxFret={MAX_FRET}
          showCharacteristicNotes={showCharacteristicNotes}
          showAvoidNotes={showAvoidNotes}
        />
      ) : (
        <PianoKeyboard
          positions={positions}
          showCharacteristicNotes={showCharacteristicNotes}
          showAvoidNotes={showAvoidNotes}
        />
      )}
      <FretboardLegend />

      {availableScales.length === 0 && (
        <p className="text-center text-muted text-sm">
          このコードに対応するスケールが見つかりません
        </p>
      )}
    </section>
  );
}

/** ボイシングカード */
export function VoicingCard({
  data,
}: {
  data: Pick<ChordScaleData, "chordSymbol" | "voicings" | "activeInstrument">;
}) {
  const { chordSymbol, voicings, activeInstrument } = data;

  if (activeInstrument !== "fretboard" || voicings.length === 0) return null;

  return <VoicingGrid voicings={voicings} chordSymbol={chordSymbol} />;
}

/** 全体をまとめるコンポーネント（1回だけ計算して子に渡す） */
export function ChordScaleLookup() {
  const data = useChordScaleData();

  return (
    <div className="flex flex-col gap-6">
      <ChordSelector data={data} />
      <ScaleCard data={data} />
      <VoicingCard data={data} />
    </div>
  );
}
