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
 * 縦に弦、横にフレットを配置した伝統的なコード表記
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

  // 弦番号（左が6弦、右が1弦）
  const strings = [6, 5, 4, 3, 2, 1] as const;

  return (
    <button
      type="button"
      className={cn(
        "flex flex-col items-center gap-1 rounded-md p-2 transition-colors",
        isSelected ? "bg-primary/10 ring-1 ring-primary" : "bg-surface hover:bg-surface-elevated",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
      disabled={!onClick}
    >
      {/* フレット番号表示（オープンポジションでない場合） */}
      <div className="relative w-full">
        {/* ミュート・開放弦インジケーター */}
        <div className="mb-0.5 grid grid-cols-6 gap-px">
          {strings.map((s) => {
            const idx = 6 - s;
            const fret = frets[idx];
            return (
              <div key={s} className="flex items-center justify-center text-[9px] text-muted">
                {fret === null ? "×" : fret === 0 ? "○" : ""}
              </div>
            );
          })}
        </div>

        {/* ナットまたはフレット番号 */}
        <div className="relative flex items-center">
          {isOpenPosition ? (
            <div className="h-[3px] w-full rounded-sm bg-foreground/70" />
          ) : (
            <div className="flex w-full items-center">
              <span className="absolute -left-4 text-[9px] text-muted">{startFret}</span>
              <div className="h-px w-full bg-foreground/20" />
            </div>
          )}
        </div>

        {/* フレットグリッド */}
        <div className="relative">
          {displayFrets.map((fret) => (
            <div key={fret} className="relative grid grid-cols-6 gap-px">
              {strings.map((s) => {
                const idx = 6 - s;
                const stringFret = frets[idx];
                const isPressed = stringFret === fret;
                const isRoot =
                  isPressed &&
                  getNoteAtPosition(s, fret).pitchClass === voicing.chord.root.pitchClass;

                return (
                  <div key={s} className="relative flex h-5 items-center justify-center">
                    {/* 弦の線 */}
                    <div
                      className={cn(
                        "absolute inset-y-0 left-1/2 -translate-x-1/2 bg-foreground/20",
                        s >= 5 ? "w-[1.5px]" : "w-px"
                      )}
                    />
                    {/* フレットの線 */}
                    <div className="absolute inset-x-0 bottom-0 h-px bg-foreground/15" />
                    {/* 押さえるポイント */}
                    {isPressed && (
                      <div
                        className={cn(
                          "relative z-10 flex size-3.5 items-center justify-center rounded-full font-bold text-[8px]",
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

              {/* バレー表示 */}
              {barreInfo && barreInfo.fret === fret && <BarreLine barreInfo={barreInfo} />}
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
}: {
  barreInfo: { fret: number; fromString: number; toString: number };
}) {
  // バレー範囲を計算（6弦=左, 1弦=右）
  // 弦番号をグリッドのカラム位置に変換（6弦=col1, 1弦=col6）
  const startCol = 7 - barreInfo.toString; // 高い弦番号 → 左側
  const endCol = 7 - barreInfo.fromString; // 低い弦番号 → 右側

  return (
    <div
      className="pointer-events-none absolute top-1/2 z-20 h-2 -translate-y-1/2 rounded-full bg-foreground/60"
      style={{
        left: `${((startCol - 1) / 6) * 100 + 100 / 12}%`,
        right: `${((6 - endCol) / 6) * 100 + 100 / 12}%`,
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
