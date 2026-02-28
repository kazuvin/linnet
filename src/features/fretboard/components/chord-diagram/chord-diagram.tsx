import { type ChordVoicing, getNoteAtPosition } from "@/lib/music-theory";
import { cn } from "@/lib/utils";

type ChordDiagramProps = {
  voicing: ChordVoicing;
  isSelected?: boolean;
  onClick?: () => void;
};

const DISPLAY_FRET_COUNT = 4;

/**
 * コードダイアグラム（コード譜）表示コンポーネント
 * 横向きレイアウト: 弦が横線、フレットが縦線、弦番号が下
 * 1弦が上、6弦が下（ギターを上から見た配置）
 */
export function ChordDiagram({ voicing, isSelected = false, onClick }: ChordDiagramProps) {
  const { frets, barreInfo } = voicing;

  // 表示するフレット範囲を計算
  const frettedPositions = frets.filter((f): f is number => f !== null && f > 0);
  const minFret = frettedPositions.length > 0 ? Math.min(...frettedPositions) : 0;
  const maxFret = frettedPositions.length > 0 ? Math.max(...frettedPositions) : 0;

  // ナットを表示するか（オープンポジション）
  const isOpenPosition = minFret <= DISPLAY_FRET_COUNT && maxFret <= DISPLAY_FRET_COUNT;
  const startFret = isOpenPosition ? 1 : minFret;
  const displayFrets = Array.from({ length: DISPLAY_FRET_COUNT }, (_, i) => startFret + i);

  // 弦: 1弦(上) → 6弦(下)
  const strings = [1, 2, 3, 4, 5, 6] as const;

  return (
    <button
      type="button"
      className={cn(
        "flex shrink-0 flex-col items-center gap-1 rounded-lg p-2 transition-colors",
        isSelected ? "bg-primary/10 ring-1 ring-primary" : "bg-surface hover:bg-surface-elevated",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
      disabled={!onClick}
    >
      <div className="relative">
        {/* フレット番号（オープンでない場合） */}
        {!isOpenPosition && (
          <div className="mb-0.5 text-center text-[9px] text-muted">{startFret}f</div>
        )}

        <div className="flex">
          {/* ミュート・開放弦インジケーター（左側） */}
          <div className="flex flex-col justify-around pr-1">
            {strings.map((s) => {
              const idx = 6 - s;
              const fret = frets[idx];
              return (
                <div
                  key={s}
                  className="flex h-4 w-3 items-center justify-center text-[9px] text-muted"
                >
                  {fret === null ? "×" : fret === 0 ? "○" : ""}
                </div>
              );
            })}
          </div>

          {/* ナットまたは開始線 */}
          <div className="flex items-stretch">
            {isOpenPosition ? (
              <div className="w-[3px] rounded-sm bg-foreground/70" />
            ) : (
              <div className="w-px bg-foreground/20" />
            )}
          </div>

          {/* フレットグリッド: 弦=行、フレット=列 */}
          <div className="relative flex flex-col">
            {strings.map((s) => {
              const idx = 6 - s;
              return (
                <div key={s} className="flex">
                  {displayFrets.map((fret) => {
                    const stringFret = frets[idx];
                    const isPressed = stringFret === fret;
                    const isRoot =
                      isPressed &&
                      getNoteAtPosition(s, fret).pitchClass === voicing.chord.root.pitchClass;

                    return (
                      <div key={fret} className="relative flex h-4 w-6 items-center justify-center">
                        {/* 弦の線（横） */}
                        <div
                          className={cn(
                            "absolute inset-x-0 top-1/2 -translate-y-1/2 bg-foreground/20",
                            s >= 5 ? "h-[1.5px]" : "h-px"
                          )}
                        />
                        {/* フレットの線（縦、右端） */}
                        <div className="absolute inset-y-0 right-0 w-px bg-foreground/15" />
                        {/* 押さえるポイント */}
                        {isPressed && (
                          <div
                            className={cn(
                              "relative z-10 flex size-3.5 items-center justify-center rounded-full font-bold text-[7px]",
                              isRoot
                                ? "bg-chord-root text-chord-root-fg"
                                : "bg-chord-tone text-chord-tone-fg"
                            )}
                          >
                            {getNoteAtPosition(s, fret).name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* バレー表示（縦線） */}
            {barreInfo && <BarreLine barreInfo={barreInfo} startFret={startFret} />}
          </div>
        </div>

        {/* 弦番号（下部） */}
        <div className="mt-0.5 flex items-center gap-0">
          <div className="w-3 shrink-0 pr-1" />
          <div className={isOpenPosition ? "w-[3px] shrink-0" : "w-px shrink-0"} />
          {strings.map((s) => (
            <div key={s} className="w-6 text-center text-[8px] text-muted">
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* ポジション名 */}
      <span className="text-[10px] text-muted">
        {getRootStringLabel(voicing.rootString)}
        {isOpenPosition ? "" : ` ${startFret}f`}
      </span>
    </button>
  );
}

function BarreLine({
  barreInfo,
  startFret,
}: {
  barreInfo: { fret: number; fromString: number; toString: number };
  startFret: number;
}) {
  // バレーの行範囲を計算（1弦=row0, 6弦=row5）
  const startRow = barreInfo.fromString - 1; // 1弦=0
  const endRow = barreInfo.toString - 1; // 6弦=5
  // バレーのフレット列位置
  const fretCol = barreInfo.fret - startFret;

  if (fretCol < 0 || fretCol >= DISPLAY_FRET_COUNT) return null;

  // 各行の高さ: h-4 = 16px, 幅: w-6 = 24px
  const rowHeight = 16;
  const colWidth = 24;

  return (
    <div
      className="pointer-events-none absolute z-20 w-2 rounded-full bg-foreground/60"
      style={{
        left: `${fretCol * colWidth + colWidth / 2 - 4}px`,
        top: `${startRow * rowHeight + 4}px`,
        height: `${(endRow - startRow) * rowHeight + 8}px`,
      }}
    />
  );
}

function getRootStringLabel(rootString: number): string {
  switch (rootString) {
    case 6:
      return "6弦R";
    case 5:
      return "5弦R";
    case 4:
      return "4弦R";
    default:
      return "";
  }
}
