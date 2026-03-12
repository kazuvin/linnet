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

/**
 * 文字単位でアニメーションするテキストコンポーネント。
 * テキスト変更時に共通文字は自然にスライドし、
 * 新規文字は幅が広がりながらフェードイン、削除文字は幅が縮みながらフェードアウトする。
 */
export function AnimatedText({
  text,
  className,
  as: Tag = "span",
  duration = 300,
}: AnimatedTextProps) {
  const [displayChars, setDisplayChars] = useState<DisplayChar[]>(() =>
    text.split("").map((char) => ({ id: genId(), char, state: "stable" as const }))
  );
  const prevTextRef = useRef(text);
  const wrapperRefs = useRef(new Map<string, HTMLSpanElement>());
  const innerRefs = useRef(new Map<string, HTMLSpanElement>());
  const cleanupTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // テキスト変更を検知して displayChars を更新
  useLayoutEffect(() => {
    if (text === prevTextRef.current) return;
    const oldText = prevTextRef.current;
    prevTextRef.current = text;

    if (cleanupTimer.current) {
      clearTimeout(cleanupTimer.current);
    }

    setDisplayChars((prev) => {
      const stableOld = prev.filter((c) => c.state !== "exiting");
      const diff = computeCharDiff(oldText, text);
      return mergeDisplayChars(stableOld, diff, genId);
    });
  }, [text]);

  // 表示文字が変わったらアニメーションを適用
  useLayoutEffect(() => {
    const hasAnimation = displayChars.some((c) => c.state !== "stable");
    if (!hasAnimation) return;

    // Phase 1: 自然幅を計測
    const naturalWidths = new Map<string, number>();
    for (const dc of displayChars) {
      const inner = innerRefs.current.get(dc.id);
      if (inner) {
        naturalWidths.set(dc.id, inner.getBoundingClientRect().width);
      }
    }

    // Phase 2: 初期状態を設定（ペイント前）
    for (const dc of displayChars) {
      const wrapper = wrapperRefs.current.get(dc.id);
      if (!wrapper) continue;

      if (dc.state === "entering") {
        wrapper.style.transition = "none";
        wrapper.style.width = "0px";
        wrapper.style.opacity = "0";
      } else if (dc.state === "exiting") {
        wrapper.style.transition = "none";
        wrapper.style.width = `${naturalWidths.get(dc.id) ?? wrapper.offsetWidth}px`;
        wrapper.style.opacity = "1";
      }
    }

    // リフロー強制
    document.body.offsetHeight;

    // Phase 3: トランジション開始
    requestAnimationFrame(() => {
      const t = `width ${duration}ms var(--ease-default), opacity ${duration}ms ease`;

      for (const dc of displayChars) {
        const wrapper = wrapperRefs.current.get(dc.id);
        if (!wrapper) continue;

        if (dc.state === "entering") {
          wrapper.style.transition = t;
          wrapper.style.width = `${naturalWidths.get(dc.id) ?? 0}px`;
          wrapper.style.opacity = "1";
        } else if (dc.state === "exiting") {
          wrapper.style.transition = t;
          wrapper.style.width = "0px";
          wrapper.style.opacity = "0";
        }
      }
    });

    // アニメーション完了後にクリーンアップ
    cleanupTimer.current = setTimeout(() => {
      setDisplayChars((prev) => {
        const cleaned = prev.filter((c) => c.state !== "exiting");
        return cleaned.map((c) => ({ ...c, state: "stable" as const }));
      });
      // インラインスタイルをリセット
      for (const wrapper of wrapperRefs.current.values()) {
        wrapper.style.transition = "";
        wrapper.style.width = "";
        wrapper.style.opacity = "";
      }
    }, duration + 50);

    return () => {
      if (cleanupTimer.current) clearTimeout(cleanupTimer.current);
    };
  }, [displayChars, duration]);

  return (
    <Tag className={className} style={{ display: "inline-flex" }}>
      {displayChars.map((dc) => (
        <span
          key={dc.id}
          ref={(el: HTMLSpanElement | null) => {
            if (el) wrapperRefs.current.set(dc.id, el);
            else wrapperRefs.current.delete(dc.id);
          }}
          style={{
            display: "inline-block",
            overflow: "hidden",
            whiteSpace: "pre",
          }}
        >
          <span
            ref={(el: HTMLSpanElement | null) => {
              if (el) innerRefs.current.set(dc.id, el);
              else innerRefs.current.delete(dc.id);
            }}
            style={{ display: "inline-block" }}
          >
            {dc.char}
          </span>
        </span>
      ))}
    </Tag>
  );
}
