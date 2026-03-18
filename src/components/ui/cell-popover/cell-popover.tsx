"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type CellPopoverProps = {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

/**
 * セル要素にアンカーされたポップオーバー。
 * セルの下に表示され、画面外にはみ出す場合は自動調整する。
 */
export function CellPopover({ anchorRef, open, onClose, children }: CellPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  // ポジション計算
  useEffect(() => {
    if (!open || !anchorRef.current) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const popover = popoverRef.current;
      const popoverWidth = popover?.offsetWidth ?? 160;

      let left = rect.left + rect.width / 2 - popoverWidth / 2;
      // 画面右端からはみ出す場合
      if (left + popoverWidth > window.innerWidth - 8) {
        left = window.innerWidth - popoverWidth - 8;
      }
      // 画面左端からはみ出す場合
      if (left < 8) {
        left = 8;
      }

      setPosition({
        top: rect.bottom + 4 + window.scrollY,
        left: left + window.scrollX,
      });
    };

    updatePosition();
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

  return createPortal(
    <div
      ref={popoverRef}
      className={cn(
        "fixed z-50 animate-in rounded-lg border border-foreground/10 bg-background p-1 shadow-dropdown duration-200",
        "fade-in-0 zoom-in-95 slide-in-from-top-2"
      )}
      style={
        position
          ? { top: position.top, left: position.left }
          : { visibility: "hidden" as const, top: 0, left: 0 }
      }
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
