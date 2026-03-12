"use client";

import { useMemo, useState } from "react";
import { PlayIcon, StopIcon } from "@/components/icons";
import { AnimatedText } from "@/components/ui/animated-text";
import { IconButton } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabNav, TabNavItem } from "@/components/ui/tab-nav";
import { ChordDiagram, FretboardGrid, FretboardLegend } from "@/features/fretboard/components";
import type { InstrumentTab } from "@/features/fretboard/stores/fretboard-store";
import { useFretboardStore } from "@/features/fretboard/stores/fretboard-store";
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

const QUALITY_OPTIONS: { value: ChordQuality; label: string }[] = [
  // 基本トライアド
  { value: "major", label: "Major" },
  { value: "minor", label: "Minor" },
  { value: "diminished", label: "dim" },
  { value: "augmented", label: "aug" },
  { value: "sus2", label: "sus2" },
  { value: "sus4", label: "sus4" },
  // 7thコード
  { value: "dominant7", label: "7" },
  { value: "major7", label: "M7" },
  { value: "minor7", label: "m7" },
  { value: "minor7b5", label: "m7(b5)" },
  { value: "diminished7", label: "dim7" },
  { value: "augmented7", label: "aug7" },
  { value: "minorMajor7", label: "mM7" },
  { value: "7sus4", label: "7sus4" },
  // 6thコード
  { value: "6", label: "6" },
  { value: "minor6", label: "m6" },
  // 9th・テンション系
  { value: "add9", label: "add9" },
  { value: "dominant9", label: "9" },
  { value: "major9", label: "M9" },
  { value: "minor9", label: "m9" },
  { value: "dominant7sharp9", label: "7(#9)" },
  { value: "dominant7flat9", label: "7(b9)" },
];

const MAX_FRET_OPTIONS = [12, 15, 19, 22, 24] as const;

type RootStringFilter = "all" | "6" | "5" | "4";

function useChordScaleData() {
  const { rootName, quality, selectedScaleType, setRootName, setQuality, setSelectedScaleType } =
    useChordScaleLookupStore();
  const {
    maxFret,
    showCharacteristicNotes,
    showAvoidNotes,
    activeInstrument,
    setActiveInstrument,
  } = useFretboardStore();
  const setMaxFret = useFretboardStore((s) => s.setMaxFret);

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
    return findOverlayPositions(rootName, activeScaleType, rootName, quality, maxFret);
  }, [rootName, quality, activeScaleType, maxFret]);

  const voicings = useMemo(
    () => findChordPositions(rootName, quality, maxFret),
    [rootName, quality, maxFret]
  );

  return {
    rootName,
    quality,
    selectedScaleType,
    setRootName,
    setQuality,
    setSelectedScaleType,
    maxFret,
    setMaxFret,
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

/** コードセレクター（カード外に配置） */
export function ChordSelector() {
  const { rootName, quality, chordSymbol, setRootName, setQuality } = useChordScaleData();

  return (
    <section className="flex flex-col gap-3">
      <AnimatedText
        as="h1"
        text={chordSymbol}
        className="font-bold text-5xl tracking-tight lg:text-6xl"
      />
      <div className="flex flex-wrap items-center gap-3">
        <span className="shrink-0 font-medium text-muted text-sm">コード</span>
        <RootNoteSelector value={rootName} onValueChange={setRootName} />
        <Select value={quality} onValueChange={(v) => setQuality(v as ChordQuality)}>
          <SelectTrigger>
            <SelectValue>{QUALITY_OPTIONS.find((o) => o.value === quality)?.label}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {QUALITY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}

/** スケール＋フレットボード/鍵盤カード */
export function ScaleCard() {
  const {
    rootName,
    chordSymbol,
    availableScales,
    activeScaleType,
    positions,
    maxFret,
    setMaxFret,
    showCharacteristicNotes,
    showAvoidNotes,
    activeInstrument,
    setActiveInstrument,
    setSelectedScaleType,
  } = useChordScaleData();

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
        {activeInstrument === "fretboard" && (
          <Select value={String(maxFret)} onValueChange={(v) => setMaxFret(Number(v))}>
            <SelectTrigger>
              <SelectValue>{maxFret} フレット</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {MAX_FRET_OPTIONS.map((fret) => (
                <SelectItem key={fret} value={String(fret)}>
                  {fret} フレット
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
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
          maxFret={maxFret}
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
export function VoicingCard() {
  const { chordSymbol, voicings, activeInstrument } = useChordScaleData();
  const [rootFilter, setRootFilter] = useState<RootStringFilter>("all");

  const filteredVoicings = useMemo(() => {
    if (rootFilter === "all") return voicings;
    const rootString = Number(rootFilter);
    return voicings.filter((v) => v.rootString === rootString);
  }, [voicings, rootFilter]);

  if (activeInstrument !== "fretboard" || voicings.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-medium text-sm">{chordSymbol} のボイシング</h3>
        <span className="text-[11px] text-muted">{filteredVoicings.length}件</span>
      </div>
      <TabNav
        value={rootFilter}
        onValueChange={(v) => setRootFilter(v as RootStringFilter)}
        variant="ghost"
        size="sm"
        className="self-start"
      >
        <TabNavItem value="all">すべて</TabNavItem>
        <TabNavItem value="6">6弦R</TabNavItem>
        <TabNavItem value="5">5弦R</TabNavItem>
        <TabNavItem value="4">4弦R</TabNavItem>
      </TabNav>
      {filteredVoicings.length > 0 ? (
        <div
          key={`${chordSymbol}-${rootFilter}`}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          {filteredVoicings.map((v, index) => (
            <div
              key={`${v.rootString}-${v.frets.join(",")}`}
              className="animate-stagger-fade-in-up"
              style={{ "--stagger-index": Math.min(index, 12) } as React.CSSProperties}
            >
              <ChordDiagram voicing={v} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted text-xs">このフィルターに該当するボイシングはありません</p>
      )}
    </section>
  );
}

/** 後方互換性のためのデフォルトエクスポート（非推奨） */
export function ChordScaleLookup() {
  return (
    <div className="flex flex-col gap-6">
      <ChordSelector />
      <ScaleCard />
      <VoicingCard />
    </div>
  );
}
