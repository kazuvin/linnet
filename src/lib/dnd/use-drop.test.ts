import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDndStore } from "./dnd-store";
import { useDrop } from "./use-drop";

describe("useDrop", () => {
  beforeEach(() => {
    useDndStore.setState({
      isDragging: false,
      activeItem: null,
      activeDropZoneId: null,
      pointerPosition: null,
    });
  });

  it("dropAttributes に data-drop-zone と data-drop-accept が含まれる", () => {
    const { result } = renderHook(() =>
      useDrop({
        dropZoneId: "cell-0-3",
        accept: "chord",
        onDrop: vi.fn(),
      })
    );

    expect(result.current.dropAttributes).toEqual({
      "data-drop-zone": "cell-0-3",
      "data-drop-accept": "chord",
    });
  });

  it("ドラッグ中でないとき isOver は false", () => {
    const { result } = renderHook(() =>
      useDrop({
        dropZoneId: "cell-0-3",
        accept: "chord",
        onDrop: vi.fn(),
      })
    );

    expect(result.current.isOver).toBe(false);
  });

  it("activeDropZoneId が一致するとき isOver は true", () => {
    useDndStore.setState({
      isDragging: true,
      activeItem: { type: "chord", data: { symbol: "C" } },
      activeDropZoneId: "cell-0-3",
    });

    const { result } = renderHook(() =>
      useDrop({
        dropZoneId: "cell-0-3",
        accept: "chord",
        onDrop: vi.fn(),
      })
    );

    expect(result.current.isOver).toBe(true);
  });

  it("activeDropZoneId が異なるとき isOver は false", () => {
    useDndStore.setState({
      isDragging: true,
      activeItem: { type: "chord", data: { symbol: "C" } },
      activeDropZoneId: "cell-1-0",
    });

    const { result } = renderHook(() =>
      useDrop({
        dropZoneId: "cell-0-3",
        accept: "chord",
        onDrop: vi.fn(),
      })
    );

    expect(result.current.isOver).toBe(false);
  });

  it("ドラッグ終了時に activeDropZoneId が一致していれば onDrop が呼ばれる", () => {
    const onDrop = vi.fn();
    const item = { type: "chord", data: { symbol: "C" } };

    useDndStore.setState({
      isDragging: true,
      activeItem: item,
      activeDropZoneId: "cell-0-3",
    });

    renderHook(() =>
      useDrop({
        dropZoneId: "cell-0-3",
        accept: "chord",
        onDrop,
      })
    );

    // endDrag を呼ぶ前に onDrop が実行されるよう、subscribe で監視
    useDndStore.getState().endDrag();

    expect(onDrop).toHaveBeenCalledWith(item);
  });

  it("ドラッグ終了時に activeDropZoneId が一致しなければ onDrop は呼ばれない", () => {
    const onDrop = vi.fn();
    const item = { type: "chord", data: { symbol: "C" } };

    useDndStore.setState({
      isDragging: true,
      activeItem: item,
      activeDropZoneId: "cell-1-0",
    });

    renderHook(() =>
      useDrop({
        dropZoneId: "cell-0-3",
        accept: "chord",
        onDrop,
      })
    );

    useDndStore.getState().endDrag();

    expect(onDrop).not.toHaveBeenCalled();
  });

  it("アンマウント後はドロップコールバックが実行されない", () => {
    const onDrop = vi.fn();
    const item = { type: "chord", data: { symbol: "C" } };

    useDndStore.setState({
      isDragging: true,
      activeItem: item,
      activeDropZoneId: "cell-0-3",
    });

    const { unmount } = renderHook(() =>
      useDrop({
        dropZoneId: "cell-0-3",
        accept: "chord",
        onDrop,
      })
    );

    unmount();
    useDndStore.getState().endDrag();

    expect(onDrop).not.toHaveBeenCalled();
  });
});
