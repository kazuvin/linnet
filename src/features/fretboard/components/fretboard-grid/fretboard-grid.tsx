import { Fragment, useMemo } from "react";
import { type NoteRole, type OverlayPosition, STANDARD_TUNING } from "@/lib/music-theory";
import { cn } from "@/lib/utils";

const SINGLE_DOT_FRETS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const DOUBLE_DOT_FRETS = new Set([12, 24]);

const NOTE_DOT_STYLES: Record<NoteRole, string> = {
  "chord-root": "bg-chord-root text-chord-root-fg",
  "chord-tone": "bg-chord-tone text-chord-tone-fg",
  scale: "bg-scale-tone text-scale-tone-fg",
};

type FretboardGridProps = {
  positions: readonly OverlayPosition[];
  maxFret: number;
};

export function FretboardGrid({ positions, maxFret }: FretboardGridProps) {
  const positionMap = useMemo(() => {
    const map = new Map<string, OverlayPosition>();
    for (const pos of positions) {
      map.set(`${pos.string}-${pos.fret}`, pos);
    }
    return map;
  }, [positions]);

  const frets = Array.from({ length: maxFret + 1 }, (_, i) => i);
  const strings = [1, 2, 3, 4, 5, 6] as const;

  return (
    <div className="overflow-x-auto pb-1">
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
            className="flex h-5 items-end justify-center pb-0.5 font-mono text-[10px] text-muted"
          >
            {fret > 0 ? fret : ""}
          </div>
        ))}

        {/* String rows */}
        {strings.map((stringNum) => (
          <Fragment key={`s-${stringNum}`}>
            <div className="flex h-9 items-center justify-center font-medium font-mono text-muted text-xs">
              {STANDARD_TUNING[6 - stringNum]}
            </div>
            {frets.map((fret) => {
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
                      className={cn(
                        "relative z-10 flex size-5 items-center justify-center rounded-full font-bold font-mono text-[10px]",
                        "transition-colors duration-[120ms] ease-out",
                        NOTE_DOT_STYLES[pos.role]
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
