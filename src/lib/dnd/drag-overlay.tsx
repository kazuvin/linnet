import { createPortal } from "react-dom";
import { useDndStore } from "./dnd-store";
import type { DragItem } from "./types";

type DragOverlayProps = {
  children: (item: DragItem) => React.ReactNode;
};

export function DragOverlay({ children }: DragOverlayProps) {
  const isDragging = useDndStore((s) => s.isDragging);
  const activeItem = useDndStore((s) => s.activeItem);
  const pointerPosition = useDndStore((s) => s.pointerPosition);

  if (!isDragging || !activeItem || !pointerPosition) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        left: pointerPosition.x,
        top: pointerPosition.y,
        transform: "translate(-50%, -100%)",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      {children(activeItem)}
    </div>,
    document.body
  );
}
