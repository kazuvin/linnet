import { act, renderHook } from "@testing-library/react";
import type { GridChord } from "./chord-grid-store";
import { _resetChordGridForTesting, useChordGridStore } from "./chord-grid-store";

const GRID_SIZE = 16;

const sampleChord: GridChord = {
  rootName: "C",
  quality: "major7",
  symbol: "Cmaj7",
  source: "diatonic",
  chordFunction: "tonic",
  romanNumeral: "I",
  degree: 1,
};

const sampleChord2: GridChord = {
  rootName: "A",
  quality: "minor7",
  symbol: "Am7",
  source: "diatonic",
  chordFunction: "tonic",
  romanNumeral: "vi",
  degree: 6,
};

describe("chord-grid-store", () => {
  beforeEach(() => {
    _resetChordGridForTesting();
  });

  describe("初期状態", () => {
    it("bpm: 120, cells: 16個のnull, isPlaying: false, currentStep: -1", () => {
      const { result } = renderHook(() => useChordGridStore());
      expect(result.current.bpm).toBe(120);
      expect(result.current.cells).toHaveLength(GRID_SIZE);
      expect(result.current.cells.every((c) => c === null)).toBe(true);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.currentStep).toBe(-1);
    });
  });

  describe("setBpm", () => {
    it("BPM を設定できる", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        useChordGridStore.getState().setBpm(140);
      });
      expect(result.current.bpm).toBe(140);
    });

    it("BPM の下限は 30", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        useChordGridStore.getState().setBpm(10);
      });
      expect(result.current.bpm).toBe(30);
    });

    it("BPM の上限は 300", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        useChordGridStore.getState().setBpm(500);
      });
      expect(result.current.bpm).toBe(300);
    });
  });

  describe("setCell", () => {
    it("指定位置にコードを配置できる", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        useChordGridStore.getState().setCell(0, sampleChord);
      });
      expect(result.current.cells[0]).toEqual(sampleChord);
      expect(result.current.cells[1]).toBeNull();
    });

    it("範囲外のインデックスは無視される", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        useChordGridStore.getState().setCell(-1, sampleChord);
        useChordGridStore.getState().setCell(16, sampleChord);
      });
      expect(result.current.cells.every((c) => c === null)).toBe(true);
    });
  });

  describe("clearCell", () => {
    it("指定位置のコードをクリアできる", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        useChordGridStore.getState().setCell(0, sampleChord);
      });
      expect(result.current.cells[0]).toEqual(sampleChord);

      await act(async () => {
        useChordGridStore.getState().clearCell(0);
      });
      expect(result.current.cells[0]).toBeNull();
    });

    it("範囲外のインデックスは無視される", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        useChordGridStore.getState().clearCell(-1);
        useChordGridStore.getState().clearCell(16);
      });
      expect(result.current.cells.every((c) => c === null)).toBe(true);
    });
  });

  describe("clearGrid", () => {
    it("全セルをクリアし、再生も停止する", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        const s = useChordGridStore.getState();
        s.setCell(0, sampleChord);
        s.setCell(4, sampleChord2);
        s.setPlaying(true);
        s.setCurrentStep(3);
      });

      await act(async () => {
        useChordGridStore.getState().clearGrid();
      });

      expect(result.current.cells.every((c) => c === null)).toBe(true);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.currentStep).toBe(-1);
    });
  });

  describe("setPlaying / setCurrentStep", () => {
    it("再生状態を設定できる", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        useChordGridStore.getState().setPlaying(true);
      });
      expect(result.current.isPlaying).toBe(true);
    });

    it("現在のステップを設定できる", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        useChordGridStore.getState().setCurrentStep(7);
      });
      expect(result.current.currentStep).toBe(7);
    });

    it("停止時に currentStep が -1 にリセットされる", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        useChordGridStore.getState().setPlaying(true);
        useChordGridStore.getState().setCurrentStep(5);
      });
      expect(result.current.currentStep).toBe(5);

      await act(async () => {
        useChordGridStore.getState().stop();
      });
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.currentStep).toBe(-1);
    });
  });

  describe("getChordAtStep", () => {
    it("コードが配置されたステップではそのコードを返す", async () => {
      await act(async () => {
        useChordGridStore.getState().setCell(0, sampleChord);
        useChordGridStore.getState().setCell(4, sampleChord2);
      });
      expect(useChordGridStore.getState().getChordAtStep(0)).toEqual(sampleChord);
      expect(useChordGridStore.getState().getChordAtStep(4)).toEqual(sampleChord2);
    });

    it("null セルでは直前のコードを返す（持続）", async () => {
      await act(async () => {
        useChordGridStore.getState().setCell(0, sampleChord);
      });
      expect(useChordGridStore.getState().getChordAtStep(1)).toEqual(sampleChord);
      expect(useChordGridStore.getState().getChordAtStep(3)).toEqual(sampleChord);
    });

    it("先頭が null の場合は null を返す（無音）", () => {
      expect(useChordGridStore.getState().getChordAtStep(0)).toBeNull();
    });

    it("コードの前の null セルは null を返す", async () => {
      await act(async () => {
        useChordGridStore.getState().setCell(4, sampleChord);
      });
      expect(useChordGridStore.getState().getChordAtStep(0)).toBeNull();
      expect(useChordGridStore.getState().getChordAtStep(3)).toBeNull();
      expect(useChordGridStore.getState().getChordAtStep(4)).toEqual(sampleChord);
      expect(useChordGridStore.getState().getChordAtStep(5)).toEqual(sampleChord);
    });
  });

  describe("addChordToNextBeat", () => {
    it("最初の拍位置（0）にコードを追加する", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        useChordGridStore.getState().addChordToNextBeat(sampleChord);
      });
      expect(result.current.cells[0]).toEqual(sampleChord);
    });

    it("次の拍位置（4, 8, 12）に順番に追加される", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        const s = useChordGridStore.getState();
        s.addChordToNextBeat(sampleChord);
        s.addChordToNextBeat(sampleChord2);
      });
      expect(result.current.cells[0]).toEqual(sampleChord);
      expect(result.current.cells[4]).toEqual(sampleChord2);
    });

    it("全拍位置が埋まっている場合は追加しない", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        const s = useChordGridStore.getState();
        s.setCell(0, sampleChord);
        s.setCell(4, sampleChord);
        s.setCell(8, sampleChord);
        s.setCell(12, sampleChord);
      });
      await act(async () => {
        useChordGridStore.getState().addChordToNextBeat(sampleChord2);
      });
      // 何も変わらない
      expect(result.current.cells[0]).toEqual(sampleChord);
      expect(result.current.cells[1]).toBeNull();
    });
  });

  describe("_resetChordGridForTesting", () => {
    it("初期状態に戻る", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        const s = useChordGridStore.getState();
        s.setBpm(180);
        s.setCell(0, sampleChord);
        s.setPlaying(true);
        s.setCurrentStep(10);
      });

      await act(async () => {
        _resetChordGridForTesting();
      });

      expect(result.current.bpm).toBe(120);
      expect(result.current.cells.every((c) => c === null)).toBe(true);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.currentStep).toBe(-1);
    });
  });
});
