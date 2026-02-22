import { useCallback, useLayoutEffect, useRef } from "react";

type Rect = { x: number; y: number };

export function useFlipAnimation<T extends string | number>(keys: readonly T[]) {
  const positionsRef = useRef<Map<T, Rect>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  const capturePositions = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const next = new Map<T, Rect>();
    for (const child of Array.from(container.children) as HTMLElement[]) {
      const key = child.dataset.flipKey as T | undefined;
      if (key == null) continue;
      const rect = child.getBoundingClientRect();
      next.set(key, { x: rect.left, y: rect.top });
    }
    positionsRef.current = next;
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: keys はアニメーショントリガーとして意図的に依存配列に含めている
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prev = positionsRef.current;
    if (prev.size === 0) return;
    positionsRef.current = new Map();

    for (const child of Array.from(container.children) as HTMLElement[]) {
      const key = child.dataset.flipKey as T | undefined;
      if (key == null) continue;

      const oldPos = prev.get(key);
      if (!oldPos) continue;

      const newRect = child.getBoundingClientRect();
      const dx = oldPos.x - newRect.left;
      const dy = oldPos.y - newRect.top;

      if (dx === 0 && dy === 0) continue;

      child.style.transform = `translate(${dx}px, ${dy}px)`;
      child.style.transition = "none";

      requestAnimationFrame(() => {
        child.style.transition =
          "transform 250ms var(--ease-default, cubic-bezier(0.25, 0.46, 0.45, 0.94))";
        child.style.transform = "";
        child.addEventListener(
          "transitionend",
          () => {
            child.style.transition = "";
          },
          { once: true }
        );
      });
    }
  }, [keys]);

  return { containerRef, capturePositions };
}
