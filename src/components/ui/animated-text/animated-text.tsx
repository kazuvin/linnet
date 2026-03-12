"use client";

import { type ElementType, useCallback, useLayoutEffect, useRef } from "react";
import { computeCharDiff } from "./compute-char-diff";

type AnimatedTextProps = {
  text: string;
  className?: string;
  as?: ElementType;
  duration?: number;
};

/**
 * 文字単位でアニメーションするテキストコンポーネント。
 * テキスト変更時に共通文字は移動し、新規文字はフェードイン、削除文字はフェードアウトする。
 */
export function AnimatedText({
  text,
  className,
  as: Tag = "span",
  duration = 300,
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const charEls = useRef<(HTMLSpanElement | null)[]>([]);
  const savedPositions = useRef<{ left: number }[]>([]);
  const prevText = useRef(text);
  const isInitial = useRef(true);

  charEls.current.length = text.length;

  const measure = useCallback(() => {
    const c = containerRef.current;
    if (!c) return [];
    const cl = c.getBoundingClientRect().left;
    return charEls.current.map((el) =>
      el ? { left: el.getBoundingClientRect().left - cl } : { left: 0 }
    );
  }, []);

  // 安定レンダー後に位置を保存する
  useLayoutEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      savedPositions.current = measure();
      return;
    }
    if (text === prevText.current) {
      savedPositions.current = measure();
    }
  });

  // テキスト変更時の FLIP アニメーション
  useLayoutEffect(() => {
    const old = prevText.current;
    if (text === old) return;

    const diff = computeCharDiff(old, text);
    const oldPos = savedPositions.current;
    prevText.current = text;

    const newPos = measure();
    const container = containerRef.current;
    if (!container) return;

    // Invert: 共通文字を旧位置に配置、新規文字を透明に
    for (let ni = 0; ni < diff.items.length; ni++) {
      const item = diff.items[ni];
      const el = charEls.current[ni];
      if (!el) continue;
      if (item.type === "stay") {
        const op = oldPos[item.oldIndex];
        const np = newPos[ni];
        if (op && np) {
          const dx = op.left - np.left;
          el.style.transition = "none";
          el.style.transform = `translateX(${dx}px)`;
        }
      } else {
        el.style.transition = "none";
        el.style.opacity = "0";
      }
    }

    // 削除文字を absolute で旧位置に配置
    const exits: HTMLSpanElement[] = [];
    for (const exit of diff.exits) {
      const op = oldPos[exit.oldIndex];
      if (!op) continue;
      const span = document.createElement("span");
      span.textContent = exit.char;
      span.style.position = "absolute";
      span.style.left = `${op.left}px`;
      span.style.top = "0";
      span.style.display = "inline-block";
      span.style.pointerEvents = "none";
      span.style.opacity = "1";
      span.style.transition = "none";
      container.appendChild(span);
      exits.push(span);
    }

    // リフロー強制
    container.offsetHeight;

    // Play: トランジション開始
    requestAnimationFrame(() => {
      const t = `transform ${duration}ms var(--ease-default), opacity ${duration}ms ease`;
      for (let ni = 0; ni < diff.items.length; ni++) {
        const item = diff.items[ni];
        const el = charEls.current[ni];
        if (!el) continue;
        el.style.transition = t;
        el.style.transform = "";
        if (item.type === "enter") el.style.opacity = "1";
      }
      for (const span of exits) {
        span.style.transition = `opacity ${duration}ms ease`;
        span.style.opacity = "0";
      }
    });

    const cleanup = () => {
      for (const s of exits) s.remove();
      for (const el of charEls.current) {
        if (el) {
          el.style.transition = "";
          el.style.transform = "";
          el.style.opacity = "";
        }
      }
      savedPositions.current = measure();
    };

    const timer = setTimeout(cleanup, duration + 50);

    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [text, duration, measure]);

  return (
    <Tag
      ref={containerRef}
      className={className}
      style={{ position: "relative", display: "inline-block" }}
    >
      {text.split("").map((char, i) => (
        <span
          key={`${i}:${char}`}
          ref={(el: HTMLSpanElement | null) => {
            charEls.current[i] = el;
          }}
          style={{ display: "inline-block" }}
        >
          {char}
        </span>
      ))}
    </Tag>
  );
}
