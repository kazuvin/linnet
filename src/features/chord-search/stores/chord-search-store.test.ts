import { beforeEach, describe, expect, it } from "vitest";
import { _resetChordSearchStoreForTesting, useChordSearchStore } from "./chord-search-store";

describe("useChordSearchStore", () => {
  beforeEach(() => {
    _resetChordSearchStoreForTesting();
  });

  it("初期状態: 選択ポジションは空", () => {
    const state = useChordSearchStore.getState();
    expect(state.selectedPositions).toEqual([]);
  });

  it("togglePosition でポジションを追加できる", () => {
    useChordSearchStore.getState().togglePosition(6, 0);
    expect(useChordSearchStore.getState().selectedPositions).toEqual([{ string: 6, fret: 0 }]);
  });

  it("togglePosition で同じポジションを削除できる", () => {
    useChordSearchStore.getState().togglePosition(6, 0);
    useChordSearchStore.getState().togglePosition(6, 0);
    expect(useChordSearchStore.getState().selectedPositions).toEqual([]);
  });

  it("複数のポジションをトグルできる", () => {
    const { togglePosition } = useChordSearchStore.getState();
    togglePosition(6, 0); // E
    togglePosition(5, 2); // B
    togglePosition(4, 2); // E
    expect(useChordSearchStore.getState().selectedPositions).toHaveLength(3);
  });

  it("clearAll で全選択をクリアできる", () => {
    const { togglePosition } = useChordSearchStore.getState();
    togglePosition(6, 0);
    togglePosition(5, 2);
    useChordSearchStore.getState().clearAll();
    expect(useChordSearchStore.getState().selectedPositions).toEqual([]);
  });

  it("初期状態: 選択コードは null", () => {
    expect(useChordSearchStore.getState().selectedChord).toBeNull();
  });

  it("selectChord でコードを選択できる", () => {
    useChordSearchStore.getState().selectChord("C", "major");
    const state = useChordSearchStore.getState();
    expect(state.selectedChord).toEqual({ rootName: "C", quality: "major" });
  });

  it("selectChord で同じコードを再選択すると解除される", () => {
    useChordSearchStore.getState().selectChord("C", "major");
    useChordSearchStore.getState().selectChord("C", "major");
    expect(useChordSearchStore.getState().selectedChord).toBeNull();
  });

  it("selectChord で別のコードを選択すると切り替わる", () => {
    useChordSearchStore.getState().selectChord("C", "major");
    useChordSearchStore.getState().selectChord("D", "minor7");
    expect(useChordSearchStore.getState().selectedChord).toEqual({
      rootName: "D",
      quality: "minor7",
    });
  });

  it("clearAll で選択コードもクリアされる", () => {
    useChordSearchStore.getState().selectChord("C", "major");
    useChordSearchStore.getState().clearAll();
    expect(useChordSearchStore.getState().selectedChord).toBeNull();
  });
});
