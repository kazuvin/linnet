import { memo } from "react";
import { type ChordVoicing, getNoteAtPosition } from "@/lib/music-theory";
import { cn } from "@/lib/utils";

type ChordDiagramProps = {
  voicing: ChordVoicing;
};

const DISPLAY_FRET_COUNT = 4;

/**
 * コードダイアグラム（コード譜）表示コンポーネント
 * 横向きレイアウト: 弦が横線、フレットが縦線
 * 1弦が上、6弦が下（ギターを上から見た配置）
 */
export const ChordDiagram = memo(function ChordDiagram({ voicing }: ChordDiagramProps) {
  const { frets } = voicing;

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
  const nutSpacerClass = isOpenPosition ? "w-[3px] shrink-0" : "w-px shrink-0";

  return (
    <div className="flex shrink-0 flex-col items-center gap-1 rounded-lg bg-surface p-2">
      <div className="flex flex-col">
        {/* フレット番号（上部） */}
        <div className="flex h-4 items-center">
          <div className={nutSpacerClass} />
          {displayFrets.map((fret, i) => (
            <div key={fret} className="w-6 text-center text-[9px] text-muted leading-4">
              {i === 0 && !isOpenPosition ? `${startFret}f` : ""}
            </div>
          ))}
        </div>

        {/* メインダイアグラム */}
        <div className="relative flex">
          {/* ミュート・開放弦インジケーター（絶対配置で左外側） */}
          <div className="absolute right-full flex flex-col justify-around pr-1">
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
          <div className="flex flex-col">
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
          </div>
        </div>

        {/* フレット番号（下部） */}
        <div className="flex">
          <div className={nutSpacerClass} />
          {displayFrets.map((fret) => (
            <div key={fret} className="w-6 text-center text-[8px] text-muted">
              {fret}
            </div>
          ))}
        </div>
      </div>

      {/* ポジション名 */}
      <span className="text-[10px] text-muted">
        {getRootStringLabel(voicing.rootString)}
        {isOpenPosition ? "" : ` ${startFret}f`}
      </span>
    </div>
  );
});

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
