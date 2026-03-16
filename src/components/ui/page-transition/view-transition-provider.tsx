"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

/**
 * 内部リンクのクリックをインターセプトし、
 * View Transitions API でナビゲーションをラップするプロバイダー。
 * 非対応ブラウザでは何もせず通常のナビゲーションが実行される。
 */
export function ViewTransitionProvider() {
  const router = useRouter();

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!document.startViewTransition) return;

      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // 外部リンク、新しいタブ、修飾キー付きクリックはスキップ
      if (
        anchor.target === "_blank" ||
        anchor.origin !== window.location.origin ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // 同じページへのナビゲーションはスキップ
      if (href === window.location.pathname) return;

      e.preventDefault();
      document.startViewTransition(() => {
        router.push(href);
      });
    },
    [router]
  );

  useEffect(() => {
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [handleClick]);

  return null;
}
