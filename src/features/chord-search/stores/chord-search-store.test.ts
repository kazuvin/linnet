import { beforeEach, describe, expect, it } from "vitest";
import type { PitchClass } from "@/lib/music-theory";
import { _resetChordSearchStoreForTesting, useChordSearchStore } from "./chord-search-store";

describe("useChordSearchStore", () => {
  beforeEach(() => {
    _resetChordSearchStoreForTesting();
  });

  it("初期状態: 選択ノートは空", () => {
    const state = useChordSearchStore.getState();
    expect(state.selectedPitchClasses).toEqual([]);
  });

  it("togglePitchClass でピッチクラスを追加できる", () => {
    useChordSearchStore.getState().togglePitchClass(0 as PitchClass);
    expect(useChordSearchStore.getState().selectedPitchClasses).toEqual([0]);
  });

  it("togglePitchClass で既存のピッチクラスを削除できる", () => {
    useChordSearchStore.getState().togglePitchClass(0 as PitchClass);
    useChordSearchStore.getState().togglePitchClass(0 as PitchClass);
    expect(useChordSearchStore.getState().selectedPitchClasses).toEqual([]);
  });

  it("複数のピッチクラスをトグルできる", () => {
    const { togglePitchClass } = useChordSearchStore.getState();
    togglePitchClass(0 as PitchClass);
    togglePitchClass(4 as PitchClass);
    togglePitchClass(7 as PitchClass);
    expect(useChordSearchStore.getState().selectedPitchClasses).toEqual([0, 4, 7]);
  });

  it("clearAll で全選択をクリアできる", () => {
    const { togglePitchClass } = useChordSearchStore.getState();
    togglePitchClass(0 as PitchClass);
    togglePitchClass(4 as PitchClass);
    useChordSearchStore.getState().clearAll();
    expect(useChordSearchStore.getState().selectedPitchClasses).toEqual([]);
  });
});
