"use client";

import { type ElementType, useLayoutEffect, useRef, useState } from "react";
import { computeCharDiff, type DisplayChar, mergeDisplayChars } from "./compute-char-diff";

type AnimatedTextProps = {
  text: string;
  className?: string;
  as?: ElementType;
  duration?: number;
};

function createIdGenerator() {
  let id = 0;
  return () => `ac-${id++}`;
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
    el.style.transition = `opacity ${duration}ms var(--ease-default)`;
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
  const savedPositions = useRef(new Map<string, number>());
  const savedWidth = useRef<number | undefined>(undefined);
  const prevTextRef = useRef(text);
  const cleanupTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const genId = useRef(createIdGenerator()).current;

  const [displayChars, setDisplayChars] = useState<DisplayChar[]>(() =>
    text.split("").map((char) => ({ id: genId(), char, state: "stable" as const }))
  );

  // 安定レンダー後に各文字の位置とコンテナ幅を保存
  useLayoutEffect(() => {
    if (displayChars.some((c) => c.state !== "stable")) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    savedWidth.current = rect.width;
    savedPositions.current.clear();
    for (const dc of displayChars) {
      const el = charRefs.current.get(dc.id);
      if (el) {
        savedPositions.current.set(dc.id, el.getBoundingClientRect().left - rect.left);
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
  }, [text, genId]);

  // アニメーション適用（FLIP + フェード）
  useLayoutEffect(() => {
    const hasAnimation = displayChars.some((c) => c.state !== "stable");
    if (!hasAnimation) return;

    const container = containerRef.current;
    if (!container) return;
    const cLeft = container.getBoundingClientRect().left;
    const newWidth = container.getBoundingClientRect().width;
    const transT = `transform ${duration}ms var(--ease-default)`;
    const fadeT = `opacity ${duration}ms var(--ease-default)`;
    const widthT = `width ${duration}ms var(--ease-default)`;

    // コンテナ幅を旧幅に固定（中央揃え時のガクつき防止）
    const oldWidth = savedWidth.current;
    if (oldWidth !== undefined && Math.abs(oldWidth - newWidth) > 0.5) {
      container.style.width = `${oldWidth}px`;
    }

    // Phase 1: 初期状態を一括設定（reflow なし）
    for (const dc of displayChars) {
      if (dc.state === "exiting") continue;
      const el = charRefs.current.get(dc.id);
      if (!el) continue;

      if (dc.state === "stable") {
        const oldLeft = savedPositions.current.get(dc.id);
        if (oldLeft !== undefined) {
          const dx = oldLeft - (el.getBoundingClientRect().left - cLeft);
          if (Math.abs(dx) > 0.5) {
            el.style.transition = "none";
            el.style.transform = `translateX(${dx}px)`;
          }
        }
      } else {
        el.style.transition = "none";
        el.style.opacity = "0";
      }
    }

    // Phase 2: reflow 1 回で全要素の初期状態を確定
    container.offsetHeight;

    // Phase 3: トランジション開始（一括設定）
    if (oldWidth !== undefined && Math.abs(oldWidth - newWidth) > 0.5) {
      container.style.transition = widthT;
      container.style.width = `${newWidth}px`;
    }

    for (const dc of displayChars) {
      if (dc.state === "exiting") continue;
      const el = charRefs.current.get(dc.id);
      if (!el) continue;

      if (dc.state === "stable") {
        if (el.style.transform) {
          el.style.transition = transT;
          el.style.transform = "";
        }
      } else {
        el.style.transition = fadeT;
        el.style.opacity = "1";
      }
    }

    // アニメーション完了後にクリーンアップ
    cleanupTimer.current = setTimeout(() => {
      setDisplayChars((prev) => {
        const cleaned = prev.filter((c) => c.state !== "exiting");
        return cleaned.map((c) => ({ ...c, state: "stable" as const }));
      });
      const c = containerRef.current;
      if (c) {
        c.style.transition = "";
        c.style.width = "";
      }
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

  // 派生値: flow (stable + entering) / exit を分離
  const flowChars: DisplayChar[] = [];
  const exitChars: DisplayChar[] = [];
  for (const dc of displayChars) {
    if (dc.state === "exiting") exitChars.push(dc);
    else flowChars.push(dc);
  }

  return (
    <Tag
      ref={containerRef}
      className={className}
      style={{ position: "relative", display: "inline-block", whiteSpace: "nowrap" }}
    >
      {flowChars.map((dc) => (
        <span
          key={dc.id}
          ref={(el: HTMLSpanElement | null) => {
            if (el) charRefs.current.set(dc.id, el);
            else charRefs.current.delete(dc.id);
          }}
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {dc.char}
        </span>
      ))}
      {exitChars.map((dc) => (
        <ExitOverlay
          key={dc.id}
          char={dc.char}
          left={savedPositions.current.get(dc.id) ?? 0}
          duration={duration}
        />
      ))}
    </Tag>
  );
}
