import { useCallback, useEffect, useRef } from "react";
import { useDndStore } from "./dnd-store";
import type { UseDragOptions, UseDragResult } from "./types";
import { findDropZoneAt } from "./utils";

const DEFAULT_DRAG_THRESHOLD = 5;

export function useDrag<T>(options: UseDragOptions<T>): UseDragResult {
  const { type, data, dragThreshold = DEFAULT_DRAG_THRESHOLD } = options;
  const isDragging = useDndStore(
    (s) => s.isDragging && s.activeItem?.type === type && s.activeItem?.data === data
  );
  const cleanupRef = useRef<(() => void) | null>(null);

  // 最新の data を ref で保持（イベントハンドラ内で参照するため）
  const dataRef = useRef(data);
  dataRef.current = data;
  const typeRef = useRef(type);
  typeRef.current = type;

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // 左ボタンのみ
      if (e.button !== 0) return;

      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      let dragging = false;

      const handleMove = (moveEvent: PointerEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        if (!dragging) {
          if (Math.abs(dx) + Math.abs(dy) >= dragThreshold) {
            dragging = true;
            useDndStore.getState().startDrag({ type: typeRef.current, data: dataRef.current });
          }
          return;
        }

        useDndStore.getState().updatePointer({ x: moveEvent.clientX, y: moveEvent.clientY });

        const dropZoneId = findDropZoneAt(moveEvent.clientX, moveEvent.clientY, typeRef.current);
        useDndStore.getState().setActiveDropZone(dropZoneId);
      };

      const handleUp = (_upEvent: PointerEvent) => {
        cleanup();

        if (dragging) {
          useDndStore.getState().endDrag();
        }
      };

      const cleanup = () => {
        document.removeEventListener("pointermove", handleMove);
        document.removeEventListener("pointerup", handleUp);
        cleanupRef.current = null;
      };

      document.addEventListener("pointermove", handleMove);
      document.addEventListener("pointerup", handleUp);
      cleanupRef.current = cleanup;
    },
    [dragThreshold]
  );

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  return {
    dragAttributes: {
      onPointerDown,
      style: { touchAction: "none" as const, userSelect: "none" as const },
    },
    isDragging,
  };
}
