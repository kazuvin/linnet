import { useEffect, useRef } from "react";
import { useDndStore } from "./dnd-store";
import type { DragItem, UseDropOptions, UseDropResult } from "./types";

// ドロップコールバックのグローバルレジストリ（useDrag の pointerup から呼ぶ用）
const dropCallbacks = new Map<string, (item: DragItem) => void>();

export function getDropCallback(dropZoneId: string): ((item: DragItem) => void) | undefined {
  return dropCallbacks.get(dropZoneId);
}

export function useDrop<T>(options: UseDropOptions<T>): UseDropResult {
  const { dropZoneId, accept, onDrop } = options;
  const isOver = useDndStore((s) => s.isDragging && s.activeDropZoneId === dropZoneId);

  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;
  const acceptRef = useRef(accept);
  acceptRef.current = accept;

  // コールバックレジストリへ登録
  useEffect(() => {
    const callback = (item: DragItem) => {
      if (item.type === acceptRef.current) {
        onDropRef.current(item as DragItem<T>);
      }
    };
    dropCallbacks.set(dropZoneId, callback);
    return () => {
      dropCallbacks.delete(dropZoneId);
    };
  }, [dropZoneId]);

  // subscribe でドラッグ終了を検出してドロップコールバック実行
  useEffect(() => {
    const unsub = useDndStore.subscribe((state, prev) => {
      if (
        prev.isDragging &&
        !state.isDragging &&
        prev.activeDropZoneId === dropZoneId &&
        prev.activeItem &&
        prev.activeItem.type === acceptRef.current
      ) {
        onDropRef.current(prev.activeItem as DragItem<T>);
      }
    });
    return unsub;
  }, [dropZoneId]);

  return {
    dropAttributes: {
      "data-drop-zone": dropZoneId,
      "data-drop-accept": accept,
    },
    isOver,
  };
}
