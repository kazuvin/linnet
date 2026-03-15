import { create } from "zustand";
import type { ChordQuality, ScaleType } from "@/lib/music-theory";

export type ChordScaleLookupState = {
  rootName: string;
  quality: ChordQuality;
  selectedScaleType: ScaleType | null;
  bassNoteName: string | undefined;
};

type ChordScaleLookupActions = {
  setRootName: (rootName: string) => void;
  setQuality: (quality: ChordQuality) => void;
  setSelectedScaleType: (scaleType: ScaleType | null) => void;
  setBassNoteName: (bassNoteName: string | undefined) => void;
};

const INITIAL_STATE: ChordScaleLookupState = {
  rootName: "C",
  quality: "major",
  selectedScaleType: null,
  bassNoteName: undefined,
};

export const useChordScaleLookupStore = create<ChordScaleLookupState & ChordScaleLookupActions>()(
  (set) => ({
    ...INITIAL_STATE,
    setRootName: (rootName) => set({ rootName, selectedScaleType: null, bassNoteName: undefined }),
    setQuality: (quality) => set({ quality, selectedScaleType: null, bassNoteName: undefined }),
    setSelectedScaleType: (scaleType) => set({ selectedScaleType: scaleType }),
    setBassNoteName: (bassNoteName) => set({ bassNoteName }),
  })
);

export function _resetChordScaleLookupStoreForTesting(): void {
  useChordScaleLookupStore.setState({ ...INITIAL_STATE });
}
