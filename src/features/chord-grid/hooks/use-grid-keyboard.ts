import { useEffect } from "react";
import { deleteSelectedGridCell } from "@/features/store-coordination";
import { useChordGridStore } from "../stores/chord-grid-store";

export function useGridKeyboard(
  selectedCell: { row: number; col: number } | null,
  clearSelection: () => void
) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is typing in an input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      // Arrow keys - work with moveSelection (no-ops if no selection)
      if (
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown"
      ) {
        e.preventDefault();
        const directionMap: Record<string, "left" | "right" | "up" | "down"> = {
          ArrowLeft: "left",
          ArrowRight: "right",
          ArrowUp: "up",
          ArrowDown: "down",
        };
        useChordGridStore.getState().moveSelection(directionMap[e.key]);
        return;
      }

      if (!selectedCell) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelectedGridCell();
      } else if (e.key === "Escape") {
        e.preventDefault();
        clearSelection();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCell, clearSelection]);
}
