import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDndStore } from "./dnd-store";
import { useDrag } from "./use-drag";

describe("useDrag", () => {
  beforeEach(() => {
    useDndStore.setState({
      isDragging: false,
      activeItem: null,
      activeDropZoneId: null,
      pointerPosition: null,
    });
  });

  it("dragAttributes に onPointerDown と touch-action: none スタイルが含まれる", () => {
    const { result } = renderHook(() => useDrag({ type: "chord", data: { symbol: "C" } }));

    expect(result.current.dragAttributes.onPointerDown).toBeTypeOf("function");
    expect(result.current.dragAttributes.style).toEqual({
      touchAction: "none",
      userSelect: "none",
    });
  });

  it("初期状態では isDragging が false", () => {
    const { result } = renderHook(() => useDrag({ type: "chord", data: { symbol: "C" } }));

    expect(result.current.isDragging).toBe(false);
  });

  it("pointerdown 後、閾値を超えて移動するとドラッグが開始される", () => {
    const { result } = renderHook(() =>
      useDrag({ type: "chord", data: { symbol: "C" }, dragThreshold: 5 })
    );

    const addEventListenerSpy = vi.spyOn(document, "addEventListener");

    act(() => {
      result.current.dragAttributes.onPointerDown({
        button: 0,
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        preventDefault: vi.fn(),
      } as unknown as React.PointerEvent);
    });

    // pointermove/pointerup リスナーが登録される
    expect(addEventListenerSpy).toHaveBeenCalledWith("pointermove", expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith("pointerup", expect.any(Function));

    // 閾値以内の移動ではドラッグ開始しない
    const moveHandler = addEventListenerSpy.mock.calls.find(
      ([event]) => event === "pointermove"
    )?.[1] as EventListener;

    act(() => {
      moveHandler(new PointerEvent("pointermove", { clientX: 103, clientY: 100 }));
    });
    expect(useDndStore.getState().isDragging).toBe(false);

    // 閾値を超える移動でドラッグ開始
    act(() => {
      moveHandler(new PointerEvent("pointermove", { clientX: 106, clientY: 100 }));
    });
    expect(useDndStore.getState().isDragging).toBe(true);
    expect(useDndStore.getState().activeItem).toEqual({
      type: "chord",
      data: { symbol: "C" },
    });

    addEventListenerSpy.mockRestore();
  });

  it("pointerup でドラッグが終了する", () => {
    const { result } = renderHook(() =>
      useDrag({ type: "chord", data: { symbol: "C" }, dragThreshold: 5 })
    );

    const addEventListenerSpy = vi.spyOn(document, "addEventListener");

    act(() => {
      result.current.dragAttributes.onPointerDown({
        button: 0,
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        preventDefault: vi.fn(),
      } as unknown as React.PointerEvent);
    });

    const moveHandler = addEventListenerSpy.mock.calls.find(
      ([event]) => event === "pointermove"
    )?.[1] as EventListener;
    const upHandler = addEventListenerSpy.mock.calls.find(
      ([event]) => event === "pointerup"
    )?.[1] as EventListener;

    // ドラッグ開始
    act(() => {
      moveHandler(new PointerEvent("pointermove", { clientX: 110, clientY: 100 }));
    });
    expect(useDndStore.getState().isDragging).toBe(true);

    // pointerup でドラッグ終了
    act(() => {
      upHandler(new PointerEvent("pointerup", { clientX: 110, clientY: 100 }));
    });
    expect(useDndStore.getState().isDragging).toBe(false);

    addEventListenerSpy.mockRestore();
  });

  it("アンマウント時にリスナーがクリーンアップされる", () => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
    const { result, unmount } = renderHook(() => useDrag({ type: "chord", data: { symbol: "C" } }));

    act(() => {
      result.current.dragAttributes.onPointerDown({
        button: 0,
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        preventDefault: vi.fn(),
      } as unknown as React.PointerEvent);
    });

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("pointermove", expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith("pointerup", expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });
});
