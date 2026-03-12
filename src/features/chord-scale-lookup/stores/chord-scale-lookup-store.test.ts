import { beforeEach, describe, expect, it } from "vitest";
import {
  _resetChordScaleLookupStoreForTesting,
  useChordScaleLookupStore,
} from "./chord-scale-lookup-store";

describe("useChordScaleLookupStore", () => {
  beforeEach(() => {
    _resetChordScaleLookupStoreForTesting();
  });

  it("初期状態が正しい", () => {
    const state = useChordScaleLookupStore.getState();
    expect(state.rootName).toBe("C");
    expect(state.quality).toBe("major");
    expect(state.selectedScaleType).toBeNull();
  });

  it("setRootName でルート音を変更できる", () => {
    useChordScaleLookupStore.getState().setRootName("G");
    expect(useChordScaleLookupStore.getState().rootName).toBe("G");
  });

  it("setQuality でコードクオリティを変更できる", () => {
    useChordScaleLookupStore.getState().setQuality("minor7");
    expect(useChordScaleLookupStore.getState().quality).toBe("minor7");
  });

  it("setSelectedScaleType でスケールを選択できる", () => {
    useChordScaleLookupStore.getState().setSelectedScaleType("dorian");
    expect(useChordScaleLookupStore.getState().selectedScaleType).toBe("dorian");
  });

  it("setSelectedScaleType に null を渡すとリセットされる", () => {
    useChordScaleLookupStore.getState().setSelectedScaleType("dorian");
    useChordScaleLookupStore.getState().setSelectedScaleType(null);
    expect(useChordScaleLookupStore.getState().selectedScaleType).toBeNull();
  });

  it("setRootName するとスケール選択がリセットされる", () => {
    useChordScaleLookupStore.getState().setSelectedScaleType("dorian");
    useChordScaleLookupStore.getState().setRootName("D");
    expect(useChordScaleLookupStore.getState().selectedScaleType).toBeNull();
  });

  it("setQuality するとスケール選択がリセットされる", () => {
    useChordScaleLookupStore.getState().setSelectedScaleType("dorian");
    useChordScaleLookupStore.getState().setQuality("minor");
    expect(useChordScaleLookupStore.getState().selectedScaleType).toBeNull();
  });
});
