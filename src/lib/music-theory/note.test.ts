import {
  areEnharmonic,
  createNote,
  FLAT_NOTE_NAMES,
  NOTE_NAMES,
  noteNameToPitchClass,
  pitchClassToNoteName,
  transposeNote,
} from "./note";

describe("note", () => {
  describe("NOTE_NAMES", () => {
    it("シャープ系の12音名を定義する", () => {
      expect(NOTE_NAMES).toEqual(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]);
    });

    it("12要素である", () => {
      expect(NOTE_NAMES).toHaveLength(12);
    });
  });

  describe("FLAT_NOTE_NAMES", () => {
    it("フラット系の12音名を定義する", () => {
      expect(FLAT_NOTE_NAMES).toEqual([
        "C",
        "Db",
        "D",
        "Eb",
        "E",
        "F",
        "Gb",
        "G",
        "Ab",
        "A",
        "Bb",
        "B",
      ]);
    });

    it("12要素である", () => {
      expect(FLAT_NOTE_NAMES).toHaveLength(12);
    });
  });

  describe("noteNameToPitchClass", () => {
    it("Cのピッチクラスは0", () => {
      expect(noteNameToPitchClass("C")).toBe(0);
    });

    it("C#のピッチクラスは1", () => {
      expect(noteNameToPitchClass("C#")).toBe(1);
    });

    it("Dbのピッチクラスは1", () => {
      expect(noteNameToPitchClass("Db")).toBe(1);
    });

    it("全シャープ系音名を正しく変換する", () => {
      const expected = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      const sharpNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
      for (let i = 0; i < sharpNames.length; i++) {
        expect(noteNameToPitchClass(sharpNames[i])).toBe(expected[i]);
      }
    });

    it("全フラット系音名を正しく変換する", () => {
      const expected = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      const flatNames = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
      for (let i = 0; i < flatNames.length; i++) {
        expect(noteNameToPitchClass(flatNames[i])).toBe(expected[i]);
      }
    });

    it("不正な音名でエラーを投げる", () => {
      expect(() => noteNameToPitchClass("X")).toThrow();
    });
  });

  describe("pitchClassToNoteName", () => {
    it("ピッチクラス0はC", () => {
      expect(pitchClassToNoteName(0)).toBe("C");
    });

    it("デフォルトではシャープ系で返す", () => {
      expect(pitchClassToNoteName(1)).toBe("C#");
      expect(pitchClassToNoteName(6)).toBe("F#");
    });

    it("preferFlat指定でフラット系で返す", () => {
      expect(pitchClassToNoteName(1, true)).toBe("Db");
      expect(pitchClassToNoteName(3, true)).toBe("Eb");
      expect(pitchClassToNoteName(6, true)).toBe("Gb");
      expect(pitchClassToNoteName(8, true)).toBe("Ab");
      expect(pitchClassToNoteName(10, true)).toBe("Bb");
    });

    it("ナチュラルノートはpreferFlatに関わらず同じ", () => {
      const naturals = [0, 2, 4, 5, 7, 9, 11] as const; // C, D, E, F, G, A, B
      for (const pc of naturals) {
        expect(pitchClassToNoteName(pc, false)).toBe(pitchClassToNoteName(pc, true));
      }
    });
  });

  describe("createNote", () => {
    it("音名からNoteオブジェクトを生成する", () => {
      const note = createNote("C");
      expect(note).toEqual({ pitchClass: 0, name: "C" });
    });

    it("シャープ系音名で正しく生成する", () => {
      const note = createNote("F#");
      expect(note).toEqual({ pitchClass: 6, name: "F#" });
    });

    it("フラット系音名で正しく生成する", () => {
      const note = createNote("Bb");
      expect(note).toEqual({ pitchClass: 10, name: "Bb" });
    });

    it("全12音で正しく生成できる", () => {
      const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
      for (let i = 0; i < names.length; i++) {
        const note = createNote(names[i]);
        expect(note.pitchClass).toBe(i);
        expect(note.name).toBe(names[i]);
      }
    });
  });

  describe("areEnharmonic", () => {
    it("C#とDbは異名同音", () => {
      expect(areEnharmonic(createNote("C#"), createNote("Db"))).toBe(true);
    });

    it("F#とGbは異名同音", () => {
      expect(areEnharmonic(createNote("F#"), createNote("Gb"))).toBe(true);
    });

    it("CとC#は異名同音ではない", () => {
      expect(areEnharmonic(createNote("C"), createNote("C#"))).toBe(false);
    });

    it("同じ音名同士は異名同音", () => {
      expect(areEnharmonic(createNote("A"), createNote("A"))).toBe(true);
    });

    it("全てのシャープ/フラットペアで正しく判定する", () => {
      const pairs: [string, string][] = [
        ["C#", "Db"],
        ["D#", "Eb"],
        ["F#", "Gb"],
        ["G#", "Ab"],
        ["A#", "Bb"],
      ];
      for (const [sharp, flat] of pairs) {
        expect(areEnharmonic(createNote(sharp), createNote(flat))).toBe(true);
      }
    });
  });

  describe("transposeNote", () => {
    it("Cを半音上げるとC#", () => {
      const result = transposeNote(createNote("C"), 1);
      expect(result.pitchClass).toBe(1);
    });

    it("Bを半音上げるとC（オクターブ循環）", () => {
      const result = transposeNote(createNote("B"), 1);
      expect(result.pitchClass).toBe(0);
    });

    it("Cを半音下げるとB", () => {
      const result = transposeNote(createNote("C"), -1);
      expect(result.pitchClass).toBe(11);
    });

    it("12半音移動で同じピッチクラスに戻る", () => {
      const note = createNote("E");
      const result = transposeNote(note, 12);
      expect(result.pitchClass).toBe(note.pitchClass);
    });

    it("0半音移動で同じピッチクラス", () => {
      const note = createNote("G");
      const result = transposeNote(note, 0);
      expect(result.pitchClass).toBe(note.pitchClass);
    });

    it("preferFlat指定でフラット表記を返す", () => {
      const result = transposeNote(createNote("C"), 1, true);
      expect(result.name).toBe("Db");
    });

    it("大きな正の値でも正しく循環する", () => {
      const result = transposeNote(createNote("C"), 25); // 25 = 12*2 + 1
      expect(result.pitchClass).toBe(1);
    });

    it("大きな負の値でも正しく循環する", () => {
      const result = transposeNote(createNote("C"), -13); // -13 mod 12 = 11
      expect(result.pitchClass).toBe(11);
    });
  });
});
