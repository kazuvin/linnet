import { beforeEach, describe, expect, it } from "vitest";
import { useDndStore } from "./dnd-store";

describe("dnd-store", () => {
  beforeEach(() => {
    useDndStore.setState({
      isDragging: false,
      activeItem: null,
      activeDropZoneId: null,
      pointerPosition: null,
    });
  });

  describe("初期状態", () => {
    it("ドラッグしていない状態で初期化される", () => {
      const state = useDndStore.getState();
      expect(state.isDragging).toBe(false);
      expect(state.activeItem).toBeNull();
      expect(state.activeDropZoneId).toBeNull();
      expect(state.pointerPosition).toBeNull();
    });
  });

  describe("startDrag", () => {
    it("ドラッグを開始すると isDragging が true になりアイテムが設定される", () => {
      const item = { type: "chord", data: { symbol: "C" } };
      useDndStore.getState().startDrag(item);

      const state = useDndStore.getState();
      expect(state.isDragging).toBe(true);
      expect(state.activeItem).toEqual(item);
    });
  });

  describe("updatePointer", () => {
    it("ポインタ位置を更新できる", () => {
      useDndStore.getState().updatePointer({ x: 100, y: 200 });

      const state = useDndStore.getState();
      expect(state.pointerPosition).toEqual({ x: 100, y: 200 });
    });
  });

  describe("setActiveDropZone", () => {
    it("アクティブなドロップゾーンを設定できる", () => {
      useDndStore.getState().setActiveDropZone("cell-0-3");

      expect(useDndStore.getState().activeDropZoneId).toBe("cell-0-3");
    });

    it("null を設定してドロップゾーンをクリアできる", () => {
      useDndStore.getState().setActiveDropZone("cell-0-3");
      useDndStore.getState().setActiveDropZone(null);

      expect(useDndStore.getState().activeDropZoneId).toBeNull();
    });
  });

  describe("endDrag", () => {
    it("ドラッグを終了すると全状態がリセットされる", () => {
      const item = { type: "chord", data: { symbol: "C" } };
      useDndStore.getState().startDrag(item);
      useDndStore.getState().updatePointer({ x: 100, y: 200 });
      useDndStore.getState().setActiveDropZone("cell-0-3");
      useDndStore.getState().endDrag();

      const state = useDndStore.getState();
      expect(state.isDragging).toBe(false);
      expect(state.activeItem).toBeNull();
      expect(state.activeDropZoneId).toBeNull();
      expect(state.pointerPosition).toBeNull();
    });
  });
});
