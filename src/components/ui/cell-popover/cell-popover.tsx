"use client";

import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type CellPopoverProps = {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

function computePosition(anchor: HTMLElement, popoverWidth: number): { top: number; left: number } {
  const rect = anchor.getBoundingClientRect();
  let left = rect.left + rect.width / 2 - popoverWidth / 2;
  // 画面右端からはみ出す場合
  if (left + popoverWidth > window.innerWidth - 8) {
    left = window.innerWidth - popoverWidth - 8;
  }
  // 画面左端からはみ出す場合
  if (left < 8) {
    left = 8;
  }
  return { top: rect.bottom + 4, left };
}

/**
 * セル要素にアンカーされたポップオーバー。
 * セルの下に表示され、画面外にはみ出す場合は自動調整する。
 */
export function CellPopover({ anchorRef, open, onClose, children }: CellPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  // useLayoutEffect で描画前に位置を確定させる
  useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      setPosition(null);
      return;
    }

    const anchor = anchorRef.current;
    const popoverWidth = popoverRef.current?.offsetWidth ?? 160;
    setPosition(computePosition(anchor, popoverWidth));
  }, [open, anchorRef]);

  // スクロール・リサイズ時の位置更新（通常の useEffect で十分）
  useEffect(() => {
    if (!open || !anchorRef.current) return;

    const updatePosition = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const popoverWidth = popoverRef.current?.offsetWidth ?? 160;
      setPosition(computePosition(anchor, popoverWidth));
    };

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, anchorRef]);

  // 外側クリックで閉じる
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    // 少し遅延させてクリックイベントの伝播を待つ
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose, anchorRef]);

  if (!open || typeof window === "undefined") return null;

  // 位置未確定時は非表示で DOM に配置（offsetWidth 計測用）
  if (!position) {
    return createPortal(
      <div
        ref={popoverRef}
        className="pointer-events-none fixed z-50 opacity-0"
        style={{ top: -9999, left: -9999 }}
      >
        {children}
      </div>,
      document.body
    );
  }

  return createPortal(
    <div
      ref={popoverRef}
      className="fade-in-0 zoom-in-95 fixed z-50 animate-in rounded-lg border border-foreground/10 bg-background p-1 shadow-dropdown duration-200"
      style={{ top: position.top, left: position.left }}
    >
      {children}
    </div>,
    document.body
  );
}

type CellPopoverItemProps = {
  onClick: () => void;
  children: ReactNode;
  variant?: "default" | "destructive";
};

export function CellPopoverItem({ onClick, children, variant = "default" }: CellPopoverItemProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-2.5 text-left text-sm transition-colors md:py-1.5",
        variant === "destructive"
          ? "text-destructive hover:bg-destructive/5"
          : "text-foreground hover:bg-foreground/5"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
