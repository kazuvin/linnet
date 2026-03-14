import { Fragment, useCallback, useMemo } from "react";
import {
  getNoteAtPosition,
  type NoteRole,
  type OverlayPosition,
  STANDARD_TUNING,
} from "@/lib/music-theory";
import { cn } from "@/lib/utils";

const SINGLE_DOT_FRETS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const DOUBLE_DOT_FRETS = new Set([12, 24]);

const NOTE_DOT_STYLES: Record<NoteRole, string> = {
  "chord-root": "bg-chord-root text-chord-root-fg",
  "chord-tone": "bg-chord-tone text-chord-tone-fg",
  scale: "bg-scale-tone text-scale-tone-fg",
};

type SearchPosition = {
  readonly string: number;
  readonly fret: number;
};

type FretboardGridProps = {
  positions: readonly OverlayPosition[];
  maxFret: number;
  showCharacteristicNotes: boolean;
  showAvoidNotes: boolean;
  /** コード検索モード: クリックでポジションをトグル */
  searchMode?: {
    selectedPositions: readonly SearchPosition[];
    onTogglePosition: (string: number, fret: number) => void;
  };
};

function SearchCell({
  stringNum,
  fret,
  role,
  noteName,
  onClick,
}: {
  stringNum: number;
  fret: number;
  role: "root" | "chord-tone" | null;
  noteName: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "relative flex h-9 cursor-pointer items-center justify-center",
        fret === 0 ? "border-r-[3px] border-r-foreground/50" : "border-r border-r-foreground/10"
      )}
      onClick={onClick}
    >
      {/* String line */}
      <div
        className={cn(
          "absolute inset-x-0 top-1/2 -translate-y-1/2 bg-foreground/20",
          stringNum <= 2 ? "h-px" : stringNum <= 4 ? "h-[1.5px]" : "h-[2px]"
        )}
      />
      {role !== null && (
        <div
          className={cn(
            "relative z-10 flex size-5 animate-note-pop items-center justify-center rounded-full font-bold text-[10px]",
            role === "root"
              ? "bg-chord-root text-chord-root-fg"
              : "bg-chord-tone text-chord-tone-fg"
          )}
        >
          {noteName}
        </div>
      )}
    </button>
  );
}

export function FretboardGrid({
  positions,
  maxFret,
  showCharacteristicNotes,
  showAvoidNotes,
  searchMode,
}: FretboardGridProps) {
  const isSearchMode = searchMode !== undefined;

  // 検索モード: 選択済みポジションのSet + ルートのピッチクラスを算出
  const { selectedPosSet, rootPitchClass } = useMemo(() => {
    if (!searchMode || searchMode.selectedPositions.length === 0) {
      return { selectedPosSet: new Set<string>(), rootPitchClass: null as number | null };
    }
    const set = new Set<string>();
    for (const p of searchMode.selectedPositions) {
      set.add(`${p.string}-${p.fret}`);
    }
    // 最低音（string番号が最大 = 6弦に最も近い）をルートとする
    const lowest = searchMode.selectedPositions.reduce((a, b) => {
      if (a.string > b.string) return a;
      if (a.string < b.string) return b;
      // 同じ弦ならフレットが低い方（より低い音）
      return a.fret <= b.fret ? a : b;
    });
    const rootNote = getNoteAtPosition(lowest.string, lowest.fret);
    return { selectedPosSet: set, rootPitchClass: rootNote.pitchClass };
  }, [searchMode]);

  const positionMap = useMemo(() => {
    const map = new Map<string, OverlayPosition>();
    for (const pos of positions) {
      map.set(`${pos.string}-${pos.fret}`, pos);
    }
    return map;
  }, [positions]);

  const handleCellClick = useCallback(
    (stringNum: number, fret: number) => {
      if (!searchMode) return;
      searchMode.onTogglePosition(stringNum, fret);
    },
    [searchMode]
  );

  const frets = Array.from({ length: maxFret + 1 }, (_, i) => i);
  const strings = [1, 2, 3, 4, 5, 6] as const;

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 lg:-mx-8 lg:px-8">
      <div
        className="inline-grid min-w-full"
        style={{
          gridTemplateColumns: `1.75rem repeat(${maxFret + 1}, minmax(2.25rem, 1fr))`,
        }}
      >
        {/* Fret number header */}
        <div />
        {frets.map((fret) => (
          <div
            key={`fn-${fret}`}
            className="flex h-5 items-end justify-center pb-0.5 text-[10px] text-muted"
          >
            {fret > 0 ? fret : ""}
          </div>
        ))}

        {/* String rows */}
        {strings.map((stringNum) => (
          <Fragment key={`s-${stringNum}`}>
            <div className="flex h-9 items-center justify-center font-medium text-muted text-xs">
              {STANDARD_TUNING[6 - stringNum]}
            </div>
            {frets.map((fret) => {
              if (isSearchMode) {
                const cellNote = getNoteAtPosition(stringNum, fret);
                const isSelected = selectedPosSet.has(`${stringNum}-${fret}`);
                let role: "root" | "chord-tone" | null = null;
                if (isSelected) {
                  role = cellNote.pitchClass === rootPitchClass ? "root" : "chord-tone";
                }
                return (
                  <SearchCell
                    key={`c-${stringNum}-${fret}`}
                    stringNum={stringNum}
                    fret={fret}
                    role={role}
                    noteName={cellNote.name}
                    onClick={() => handleCellClick(stringNum, fret)}
                  />
                );
              }

              const pos = positionMap.get(`${stringNum}-${fret}`);
              return (
                <div
                  key={`c-${stringNum}-${fret}`}
                  className={cn(
                    "relative flex h-9 items-center justify-center",
                    fret === 0
                      ? "border-r-[3px] border-r-foreground/50"
                      : "border-r border-r-foreground/10"
                  )}
                >
                  {/* String line */}
                  <div
                    className={cn(
                      "absolute inset-x-0 top-1/2 -translate-y-1/2 bg-foreground/20",
                      stringNum <= 2 ? "h-px" : stringNum <= 4 ? "h-[1.5px]" : "h-[2px]"
                    )}
                  />
                  {/* Note dot */}
                  {pos && (
                    <div
                      key={`${pos.role}-${stringNum}-${fret}`}
                      className={cn(
                        "relative z-10 flex size-5 items-center justify-center rounded-full font-bold text-[10px]",
                        "animate-note-pop",
                        showAvoidNotes && pos.isAvoid
                          ? "bg-avoid-note text-avoid-note-fg"
                          : NOTE_DOT_STYLES[pos.role],
                        showCharacteristicNotes &&
                          pos.isCharacteristic &&
                          "ring-[1.5px] ring-foreground/40"
                      )}
                    >
                      {pos.note.name}
                    </div>
                  )}
                </div>
              );
            })}
          </Fragment>
        ))}

        {/* Position markers */}
        <div />
        {frets.map((fret) => (
          <div key={`m-${fret}`} className="flex h-4 items-center justify-center gap-1">
            {SINGLE_DOT_FRETS.has(fret) && (
              <div className="size-1.5 rounded-full bg-foreground/15" />
            )}
            {DOUBLE_DOT_FRETS.has(fret) && (
              <>
                <div className="size-1.5 rounded-full bg-foreground/15" />
                <div className="size-1.5 rounded-full bg-foreground/15" />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
