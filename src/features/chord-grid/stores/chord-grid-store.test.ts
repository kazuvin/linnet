import { act, renderHook } from "@testing-library/react";
import type { GridChord } from "./chord-grid-store";
import { _resetChordGridForTesting, COLUMNS, useChordGridStore } from "./chord-grid-store";

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
    it("bpm: 120, rows: 1行16列のnull, isPlaying: false, currentRow/Col: -1", () => {
      const { result } = renderHook(() => useChordGridStore());
      expect(result.current.bpm).toBe(120);
      expect(result.current.rows).toHaveLength(1);
      expect(result.current.rows[0]).toHaveLength(COLUMNS);
      expect(result.current.rows[0].every((c) => c === null)).toBe(true);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.currentRow).toBe(-1);
      expect(result.current.currentCol).toBe(-1);
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
        useChordGridStore.getState().setCell(0, 0, sampleChord);
      });
      expect(result.current.rows[0][0]).toEqual(sampleChord);
      expect(result.current.rows[0][1]).toBeNull();
    });

    it("範囲外のインデックスは無視される", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        useChordGridStore.getState().setCell(-1, 0, sampleChord);
        useChordGridStore.getState().setCell(0, 16, sampleChord);
        useChordGridStore.getState().setCell(1, 0, sampleChord);
      });
      expect(result.current.rows[0].every((c) => c === null)).toBe(true);
    });
  });

  describe("clearCell", () => {
    it("指定位置のコードをクリアできる", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        useChordGridStore.getState().setCell(0, 0, sampleChord);
      });
      expect(result.current.rows[0][0]).toEqual(sampleChord);

      await act(async () => {
        useChordGridStore.getState().clearCell(0, 0);
      });
      expect(result.current.rows[0][0]).toBeNull();
    });

    it("範囲外のインデックスは無視される", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        useChordGridStore.getState().clearCell(-1, 0);
        useChordGridStore.getState().clearCell(0, 16);
      });
      expect(result.current.rows[0].every((c) => c === null)).toBe(true);
    });
  });

  describe("clearGrid", () => {
    it("全セルをクリアし、再生も停止する", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        const s = useChordGridStore.getState();
        s.setCell(0, 0, sampleChord);
        s.setCell(0, 4, sampleChord2);
        s.setPlaying(true);
        s.setCurrentPosition(0, 3);
      });

      await act(async () => {
        useChordGridStore.getState().clearGrid();
      });

      expect(result.current.rows).toHaveLength(1);
      expect(result.current.rows[0].every((c) => c === null)).toBe(true);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.currentRow).toBe(-1);
      expect(result.current.currentCol).toBe(-1);
    });
  });

  describe("addRow / removeRow", () => {
    it("行を追加できる", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        useChordGridStore.getState().addRow();
      });
      expect(result.current.rows).toHaveLength(2);
      expect(result.current.rows[1]).toHaveLength(COLUMNS);
      expect(result.current.rows[1].every((c) => c === null)).toBe(true);
    });

    it("行を削除できる", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        useChordGridStore.getState().addRow();
        useChordGridStore.getState().setCell(1, 0, sampleChord);
      });
      expect(result.current.rows).toHaveLength(2);

      await act(async () => {
        useChordGridStore.getState().removeRow(1);
      });
      expect(result.current.rows).toHaveLength(1);
    });

    it("最後の1行は削除できない", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        useChordGridStore.getState().removeRow(0);
      });
      expect(result.current.rows).toHaveLength(1);
    });
  });

  describe("setPlaying / setCurrentPosition", () => {
    it("再生状態を設定できる", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        useChordGridStore.getState().setPlaying(true);
      });
      expect(result.current.isPlaying).toBe(true);
    });

    it("現在のポジションを設定できる", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        useChordGridStore.getState().setCurrentPosition(0, 7);
      });
      expect(result.current.currentRow).toBe(0);
      expect(result.current.currentCol).toBe(7);
    });

    it("停止時に currentRow/Col が -1 にリセットされる", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        useChordGridStore.getState().setPlaying(true);
        useChordGridStore.getState().setCurrentPosition(0, 5);
      });
      expect(result.current.currentCol).toBe(5);

      await act(async () => {
        useChordGridStore.getState().stop();
      });
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.currentRow).toBe(-1);
      expect(result.current.currentCol).toBe(-1);
    });
  });

  describe("getChordAtPosition", () => {
    it("コードが配置されたセルではそのコードを返す", async () => {
      await act(async () => {
        useChordGridStore.getState().setCell(0, 0, sampleChord);
        useChordGridStore.getState().setCell(0, 4, sampleChord2);
      });
      expect(useChordGridStore.getState().getChordAtPosition(0, 0)).toEqual(sampleChord);
      expect(useChordGridStore.getState().getChordAtPosition(0, 4)).toEqual(sampleChord2);
    });

    it("null セルでは直前のコードを返す（持続）", async () => {
      await act(async () => {
        useChordGridStore.getState().setCell(0, 0, sampleChord);
      });
      expect(useChordGridStore.getState().getChordAtPosition(0, 1)).toEqual(sampleChord);
      expect(useChordGridStore.getState().getChordAtPosition(0, 3)).toEqual(sampleChord);
    });

    it("先頭が null の場合は null を返す（無音）", () => {
      expect(useChordGridStore.getState().getChordAtPosition(0, 0)).toBeNull();
    });

    it("コードの前の null セルは null を返す", async () => {
      await act(async () => {
        useChordGridStore.getState().setCell(0, 4, sampleChord);
      });
      expect(useChordGridStore.getState().getChordAtPosition(0, 0)).toBeNull();
      expect(useChordGridStore.getState().getChordAtPosition(0, 3)).toBeNull();
      expect(useChordGridStore.getState().getChordAtPosition(0, 4)).toEqual(sampleChord);
      expect(useChordGridStore.getState().getChordAtPosition(0, 5)).toEqual(sampleChord);
    });

    it("前の行の末尾コードを引き継ぐ", async () => {
      await act(async () => {
        useChordGridStore.getState().addRow();
        useChordGridStore.getState().setCell(0, 15, sampleChord);
      });
      expect(useChordGridStore.getState().getChordAtPosition(1, 0)).toEqual(sampleChord);
    });
  });

  describe("addChordToNextBeat", () => {
    it("最初の拍位置（0,0）にコードを追加する", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        useChordGridStore.getState().addChordToNextBeat(sampleChord);
      });
      expect(result.current.rows[0][0]).toEqual(sampleChord);
    });

    it("次の拍位置に順番に追加される", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        const s = useChordGridStore.getState();
        s.addChordToNextBeat(sampleChord);
        s.addChordToNextBeat(sampleChord2);
      });
      expect(result.current.rows[0][0]).toEqual(sampleChord);
      expect(result.current.rows[0][4]).toEqual(sampleChord2);
    });

    it("全拍位置が埋まっている場合は追加しない", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        const s = useChordGridStore.getState();
        s.setCell(0, 0, sampleChord);
        s.setCell(0, 4, sampleChord);
        s.setCell(0, 8, sampleChord);
        s.setCell(0, 12, sampleChord);
      });
      await act(async () => {
        useChordGridStore.getState().addChordToNextBeat(sampleChord2);
      });
      expect(result.current.rows[0][0]).toEqual(sampleChord);
      expect(result.current.rows[0][1]).toBeNull();
    });

    it("複数行にまたがって追加される", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        const s = useChordGridStore.getState();
        s.addRow();
        s.setCell(0, 0, sampleChord);
        s.setCell(0, 4, sampleChord);
        s.setCell(0, 8, sampleChord);
        s.setCell(0, 12, sampleChord);
      });
      await act(async () => {
        useChordGridStore.getState().addChordToNextBeat(sampleChord2);
      });
      expect(result.current.rows[1][0]).toEqual(sampleChord2);
    });
  });

  describe("_resetChordGridForTesting", () => {
    it("初期状態に戻る", async () => {
      const { result } = renderHook(() => useChordGridStore());
      await act(async () => {
        const s = useChordGridStore.getState();
        s.setBpm(180);
        s.setCell(0, 0, sampleChord);
        s.setPlaying(true);
        s.setCurrentPosition(0, 10);
        s.addRow();
      });

      await act(async () => {
        _resetChordGridForTesting();
      });

      expect(result.current.bpm).toBe(120);
      expect(result.current.rows).toHaveLength(1);
      expect(result.current.rows[0].every((c) => c === null)).toBe(true);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.currentRow).toBe(-1);
      expect(result.current.currentCol).toBe(-1);
    });
  });
});
