import { create } from "zustand";
import type { DndStore } from "./types";

export const useDndStore = create<DndStore>((set) => ({
  isDragging: false,
  activeItem: null,
  activeDropZoneId: null,
  pointerPosition: null,

  startDrag: (item) => set({ isDragging: true, activeItem: item }),

  updatePointer: (position) => set({ pointerPosition: position }),

  setActiveDropZone: (id) => set({ activeDropZoneId: id }),

  endDrag: () =>
    set({
      isDragging: false,
      activeItem: null,
      activeDropZoneId: null,
      pointerPosition: null,
    }),
}));
