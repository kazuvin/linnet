import { create } from "zustand";
import type { ChordQuality, ScaleType } from "@/lib/music-theory";

export type ChordScaleLookupState = {
  rootName: string;
  quality: ChordQuality;
  selectedScaleType: ScaleType | null;
};

type ChordScaleLookupActions = {
  setRootName: (rootName: string) => void;
  setQuality: (quality: ChordQuality) => void;
  setSelectedScaleType: (scaleType: ScaleType | null) => void;
};

const INITIAL_STATE: ChordScaleLookupState = {
  rootName: "C",
  quality: "major",
  selectedScaleType: null,
};

export const useChordScaleLookupStore = create<ChordScaleLookupState & ChordScaleLookupActions>()(
  (set) => ({
    ...INITIAL_STATE,
    setRootName: (rootName) => set({ rootName, selectedScaleType: null }),
    setQuality: (quality) => set({ quality, selectedScaleType: null }),
    setSelectedScaleType: (scaleType) => set({ selectedScaleType: scaleType }),
  })
);

export function _resetChordScaleLookupStoreForTesting(): void {
  useChordScaleLookupStore.setState({ ...INITIAL_STATE });
}
