export type DragItem<T = unknown> = {
  type: string;
  data: T;
};

export type PointerPosition = {
  x: number;
  y: number;
};

export type DndState = {
  isDragging: boolean;
  activeItem: DragItem | null;
  activeDropZoneId: string | null;
  pointerPosition: PointerPosition | null;
};

export type DndActions = {
  startDrag: (item: DragItem) => void;
  updatePointer: (position: PointerPosition) => void;
  setActiveDropZone: (id: string | null) => void;
  endDrag: () => void;
};

export type DndStore = DndState & DndActions;

export type UseDragOptions<T> = {
  type: string;
  data: T;
  dragThreshold?: number;
};

export type UseDragResult = {
  dragAttributes: {
    onPointerDown: (e: React.PointerEvent) => void;
    style: { touchAction: "none"; userSelect: "none" };
  };
  isDragging: boolean;
};

export type UseDropOptions<T> = {
  dropZoneId: string;
  accept: string;
  onDrop: (item: DragItem<T>) => void;
};

export type UseDropResult = {
  dropAttributes: { "data-drop-zone": string; "data-drop-accept": string };
  isOver: boolean;
};
