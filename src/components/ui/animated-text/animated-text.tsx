"use client";

import { type ElementType, useLayoutEffect, useRef, useState } from "react";
import { computeCharDiff, type DisplayChar, mergeDisplayChars } from "./compute-char-diff";

type AnimatedTextProps = {
  text: string;
  className?: string;
  as?: ElementType;
  duration?: number;
};

let nextId = 0;
function genId() {
  return `ac-${nextId++}`;
}

/** exit 文字を旧位置に absolute 配置してフェードアウトする */
function ExitOverlay({ char, left, duration }: { char: string; left: number; duration: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "none";
    el.style.opacity = "1";
    el.offsetHeight;
    el.style.transition = `opacity ${duration}ms ease`;
    el.style.opacity = "0";
  }, [duration]);

  return (
    <span
      ref={ref}
      style={{
        position: "absolute",
        left: `${left}px`,
        top: 0,
        display: "inline-block",
        pointerEvents: "none",
      }}
    >
      {char}
    </span>
  );
}

/**
 * 文字単位でアニメーションするテキストコンポーネント。
 * テキスト変更時に共通文字は FLIP でスライドし、
 * 新規文字はその場でフェードイン、削除文字は旧位置でフェードアウトする。
 */
export function AnimatedText({
  text,
  className,
  as: Tag = "span",
  duration = 300,
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const charRefs = useRef(new Map<string, HTMLSpanElement>());
  const savedPositions = useRef(new Map<string, { left: number }>());
  const prevTextRef = useRef(text);
  const cleanupTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [displayChars, setDisplayChars] = useState<DisplayChar[]>(() =>
    text.split("").map((char) => ({ id: genId(), char, state: "stable" as const }))
  );

  // レンダーごとの派生値
  const flowChars = displayChars.filter((c) => c.state !== "exiting");
  const exitChars = displayChars.filter((c) => c.state === "exiting");

  // 安定レンダー後に各文字の位置を保存
  useLayoutEffect(() => {
    if (displayChars.some((c) => c.state !== "stable")) return;
    const container = containerRef.current;
    if (!container) return;
    const cLeft = container.getBoundingClientRect().left;
    savedPositions.current.clear();
    for (const dc of displayChars) {
      const el = charRefs.current.get(dc.id);
      if (el) {
        savedPositions.current.set(dc.id, {
          left: el.getBoundingClientRect().left - cLeft,
        });
      }
    }
  });

  // テキスト変更を検知して displayChars を更新
  useLayoutEffect(() => {
    if (text === prevTextRef.current) return;
    const oldText = prevTextRef.current;
    prevTextRef.current = text;

    if (cleanupTimer.current) clearTimeout(cleanupTimer.current);

    setDisplayChars((prev) => {
      const stableOld = prev.filter((c) => c.state !== "exiting");
      const diff = computeCharDiff(oldText, text);
      return mergeDisplayChars(stableOld, diff, genId);
    });
  }, [text]);

  // アニメーション適用（FLIP + フェード）
  useLayoutEffect(() => {
    const hasAnimation = displayChars.some((c) => c.state !== "stable");
    if (!hasAnimation) return;

    const container = containerRef.current;
    if (!container) return;
    const cLeft = container.getBoundingClientRect().left;

    const flow = displayChars.filter((c) => c.state !== "exiting");
    for (const dc of flow) {
      const el = charRefs.current.get(dc.id);
      if (!el) continue;

      if (dc.state === "stable") {
        // stay 文字: FLIP で旧位置→新位置にスライド
        const oldPos = savedPositions.current.get(dc.id);
        if (oldPos) {
          const newLeft = el.getBoundingClientRect().left - cLeft;
          const dx = oldPos.left - newLeft;
          if (Math.abs(dx) > 0.5) {
            el.style.transition = "none";
            el.style.transform = `translateX(${dx}px)`;
            el.offsetHeight;
            el.style.transition = `transform ${duration}ms var(--ease-default)`;
            el.style.transform = "";
          }
        }
      } else if (dc.state === "entering") {
        // enter 文字: その場でフェードイン
        el.style.transition = "none";
        el.style.opacity = "0";
        el.offsetHeight;
        el.style.transition = `opacity ${duration}ms ease`;
        el.style.opacity = "1";
      }
    }

    // exit 文字のフェードアウトは ExitOverlay コンポーネントが処理

    cleanupTimer.current = setTimeout(() => {
      setDisplayChars((prev) => {
        const cleaned = prev.filter((c) => c.state !== "exiting");
        return cleaned.map((c) => ({ ...c, state: "stable" as const }));
      });
      for (const el of charRefs.current.values()) {
        el.style.transition = "";
        el.style.transform = "";
        el.style.opacity = "";
      }
    }, duration + 50);

    return () => {
      if (cleanupTimer.current) clearTimeout(cleanupTimer.current);
    };
  }, [displayChars, duration]);

  return (
    <Tag
      ref={containerRef}
      className={className}
      style={{ position: "relative", display: "inline-block" }}
    >
      {flowChars.map((dc) => (
        <span
          key={dc.id}
          ref={(el: HTMLSpanElement | null) => {
            if (el) charRefs.current.set(dc.id, el);
            else charRefs.current.delete(dc.id);
          }}
          style={{ display: "inline-block" }}
        >
          {dc.char}
        </span>
      ))}
      {exitChars.map((dc) => (
        <ExitOverlay
          key={dc.id}
          char={dc.char}
          left={savedPositions.current.get(dc.id)?.left ?? 0}
          duration={duration}
        />
      ))}
    </Tag>
  );
}
