"use client";

import { createPortal } from "react-dom";
import type { ToastVariant } from "./use-toast";
import { dismissToast, useToasts } from "./use-toast";

const variantStyles: Record<ToastVariant, string> = {
  success: "bg-card border border-success/30 text-foreground",
  error: "bg-card border border-error/30 text-foreground",
};

const variantIndicator: Record<ToastVariant, string> = {
  success: "bg-success",
  error: "bg-error",
};

export function Toaster() {
  const toasts = useToasts();

  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      className="pointer-events-none fixed right-0 bottom-0 z-50 flex flex-col gap-2 p-4"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <output
          key={toast.id}
          className={`pointer-events-auto flex w-72 items-center gap-3 rounded-md px-4 py-3 shadow-dropdown ${toast.exiting ? "animate-[slide-out-right_0.3s_ease_forwards]" : "animate-[slide-in-right_0.3s_ease]"} ${variantStyles[toast.variant]}`}
        >
          <span className={`h-2 w-2 shrink-0 rounded-full ${variantIndicator[toast.variant]}`} />
          <p className="flex-1 text-sm">{toast.message}</p>
          <button
            type="button"
            className="shrink-0 text-muted transition-colors hover:text-foreground"
            onClick={() => dismissToast(toast.id)}
            aria-label="閉じる"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </output>
      ))}
    </div>,
    document.body
  );
}
