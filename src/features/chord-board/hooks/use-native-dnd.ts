import { type RefObject, useCallback, useRef } from "react";
import { useChordProgressionStore } from "@/features/chord-progression/stores/chord-progression-store";
import type { ChordFunction, ChordQuality, ScaleType } from "@/lib/music-theory";

export type PaletteDragData = {
  rootName: string;
  quality: ChordQuality;
  source: "diatonic" | "secondary-dominant" | "tritone-substitution" | ScaleType;
  chordFunction: ChordFunction;
  romanNumeral: string;
  degree: number;
};

const DRAG_DATA_TYPE = "application/x-chord";

type DragSource =
  | { type: "palette"; data: PaletteDragData; addedChordId: string | null }
  | { type: "progression" };

type UseNativeDndOptions = {
  onBeforeReorder?: () => void;
  chordsCount: number;
  containerRef: RefObject<HTMLDivElement | null>;
};

const REORDER_THROTTLE_MS = 100;

function findFlipChild(container: HTMLElement, chordId: string): HTMLElement | null {
  return container.querySelector(`[data-flip-key="${chordId}"]`);
}

function hideDraggedCard(container: HTMLElement | null, chordId: string) {
  if (!container) return;
  requestAnimationFrame(() => {
    const el = findFlipChild(container, chordId);
    if (el) el.style.opacity = "0";
  });
}

function showDraggedCard(container: HTMLElement | null, chordId: string) {
  if (!container) return;
  const el = findFlipChild(container, chordId);
  if (el) el.style.opacity = "";
}

export function useNativeDnd({ onBeforeReorder, chordsCount, containerRef }: UseNativeDndOptions) {
  const dragIndexRef = useRef<number | null>(null);
  const dragSourceRef = useRef<DragSource | null>(null);
  const chordsCountRef = useRef(chordsCount);
  chordsCountRef.current = chordsCount;
  const lastReorderTimeRef = useRef(0);

  const addFromPalette = useCallback(
    (targetIndex?: number) => {
      const source = dragSourceRef.current;
      if (!source || source.type !== "palette" || source.addedChordId) return;

      onBeforeReorder?.();
      const { data } = source;
      const id = useChordProgressionStore
        .getState()
        .addChord(
          data.rootName,
          data.quality,
          data.source,
          data.chordFunction,
          data.romanNumeral,
          data.degree
        );
      source.addedChordId = id;
      const addedAt = chordsCountRef.current;
      dragIndexRef.current = addedAt;

      if (targetIndex != null && addedAt !== targetIndex) {
        useChordProgressionStore.getState().reorderChords(addedAt, targetIndex);
        dragIndexRef.current = targetIndex;
      }

      hideDraggedCard(containerRef.current, id);
    },
    [onBeforeReorder, containerRef]
  );

  const createPaletteDragHandlers = useCallback(
    (data: PaletteDragData) => ({
      draggable: true,
      onDragStart: (e: React.DragEvent) => {
        dragSourceRef.current = { type: "palette", data, addedChordId: null };
        e.dataTransfer.setData(DRAG_DATA_TYPE, "palette");
        e.dataTransfer.effectAllowed = "copyMove";
      },
      onDragEnd: () => {
        const source = dragSourceRef.current;
        if (source?.type === "palette" && source.addedChordId) {
          onBeforeReorder?.();
          useChordProgressionStore.getState().removeChord(source.addedChordId);
        }
        dragSourceRef.current = null;
        dragIndexRef.current = null;
      },
    }),
    [onBeforeReorder]
  );

  const createProgressionDragHandlers = useCallback(
    (index: number) => ({
      draggable: true,
      onDragStart: (e: React.DragEvent) => {
        dragSourceRef.current = { type: "progression" };
        dragIndexRef.current = index;
        e.dataTransfer.setData(DRAG_DATA_TYPE, "progression");
        e.dataTransfer.effectAllowed = "move";
      },
      onDragEnd: (_e: React.DragEvent) => {
        dragSourceRef.current = null;
        dragIndexRef.current = null;
      },
    }),
    []
  );

  const createDropZoneHandlers = useCallback(
    (index: number) => ({
      onDragEnter: (e: React.DragEvent) => {
        e.preventDefault();
        const source = dragSourceRef.current;
        if (!source) return;

        if (source.type === "palette" && !source.addedChordId) {
          addFromPalette(index);
          return;
        }

        if (dragIndexRef.current != null && dragIndexRef.current !== index) {
          const now = Date.now();
          if (now - lastReorderTimeRef.current < REORDER_THROTTLE_MS) return;
          lastReorderTimeRef.current = now;
          onBeforeReorder?.();
          useChordProgressionStore.getState().reorderChords(dragIndexRef.current, index);
          dragIndexRef.current = index;
        }
      },
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        const source = dragSourceRef.current;
        if (source?.type === "palette" && source.addedChordId) {
          showDraggedCard(containerRef.current, source.addedChordId);
          source.addedChordId = null;
        }
        dragSourceRef.current = null;
        dragIndexRef.current = null;
      },
    }),
    [onBeforeReorder, addFromPalette, containerRef]
  );

  const containerDropHandlers = {
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      const source = dragSourceRef.current;
      if (source?.type === "palette" && !source.addedChordId) {
        addFromPalette();
      }
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      const source = dragSourceRef.current;
      if (source?.type === "palette" && source.addedChordId) {
        showDraggedCard(containerRef.current, source.addedChordId);
        source.addedChordId = null;
      }
      dragSourceRef.current = null;
      dragIndexRef.current = null;
    },
  };

  return {
    createPaletteDragHandlers,
    createProgressionDragHandlers,
    createDropZoneHandlers,
    containerDropHandlers,
  };
}
