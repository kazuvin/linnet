import { createNote } from "./note";
import {
  createScale,
  getScaleDegreeNote,
  getScaleNotes,
  isNoteInScale,
  SCALE_PATTERNS,
  shouldPreferFlat,
} from "./scale";

describe("scale", () => {
  describe("SCALE_PATTERNS", () => {
    it("メジャースケールのパターンは [0,2,4,5,7,9,11]", () => {
      expect(SCALE_PATTERNS.major).toEqual([0, 2, 4, 5, 7, 9, 11]);
    });

    it("ナチュラルマイナースケールのパターンは [0,2,3,5,7,8,10]", () => {
      expect(SCALE_PATTERNS["natural-minor"]).toEqual([0, 2, 3, 5, 7, 8, 10]);
    });

    it("ハーモニックマイナースケールのパターンは [0,2,3,5,7,8,11]", () => {
      expect(SCALE_PATTERNS["harmonic-minor"]).toEqual([0, 2, 3, 5, 7, 8, 11]);
    });

    it("メロディックマイナースケールのパターンは [0,2,3,5,7,9,11]", () => {
      expect(SCALE_PATTERNS["melodic-minor"]).toEqual([0, 2, 3, 5, 7, 9, 11]);
    });

    it("ドリアンスケールのパターンは [0,2,3,5,7,9,10]", () => {
      expect(SCALE_PATTERNS.dorian).toEqual([0, 2, 3, 5, 7, 9, 10]);
    });

    it("フリジアンスケールのパターンは [0,1,3,5,7,8,10]", () => {
      expect(SCALE_PATTERNS.phrygian).toEqual([0, 1, 3, 5, 7, 8, 10]);
    });

    it("リディアンスケールのパターンは [0,2,4,6,7,9,11]", () => {
      expect(SCALE_PATTERNS.lydian).toEqual([0, 2, 4, 6, 7, 9, 11]);
    });

    it("ミクソリディアンスケールのパターンは [0,2,4,5,7,9,10]", () => {
      expect(SCALE_PATTERNS.mixolydian).toEqual([0, 2, 4, 5, 7, 9, 10]);
    });

    it("エオリアンスケールのパターンはナチュラルマイナーと同一", () => {
      expect(SCALE_PATTERNS.aeolian).toEqual(SCALE_PATTERNS["natural-minor"]);
    });

    it("ロクリアンスケールのパターンは [0,1,3,5,6,8,10]", () => {
      expect(SCALE_PATTERNS.locrian).toEqual([0, 1, 3, 5, 6, 8, 10]);
    });

    it("全スケールパターンが7音からなる", () => {
      for (const [, pattern] of Object.entries(SCALE_PATTERNS)) {
        expect(pattern).toHaveLength(7);
      }
    });

    it("全スケールパターンが0から始まる", () => {
      for (const [, pattern] of Object.entries(SCALE_PATTERNS)) {
        expect(pattern[0]).toBe(0);
      }
    });
  });

  describe("shouldPreferFlat", () => {
    it("Fキーではフラット表記を使う", () => {
      expect(shouldPreferFlat("F")).toBe(true);
    });

    it("Bbキーではフラット表記を使う", () => {
      expect(shouldPreferFlat("Bb")).toBe(true);
    });

    it("Ebキーではフラット表記を使う", () => {
      expect(shouldPreferFlat("Eb")).toBe(true);
    });

    it("Abキーではフラット表記を使う", () => {
      expect(shouldPreferFlat("Ab")).toBe(true);
    });

    it("Dbキーではフラット表記を使う", () => {
      expect(shouldPreferFlat("Db")).toBe(true);
    });

    it("Gbキーではフラット表記を使う", () => {
      expect(shouldPreferFlat("Gb")).toBe(true);
    });

    it("Cキーではシャープ表記を使う", () => {
      expect(shouldPreferFlat("C")).toBe(false);
    });

    it("Gキーではシャープ表記を使う", () => {
      expect(shouldPreferFlat("G")).toBe(false);
    });

    it("Dキーではシャープ表記を使う", () => {
      expect(shouldPreferFlat("D")).toBe(false);
    });

    it("Aキーではシャープ表記を使う", () => {
      expect(shouldPreferFlat("A")).toBe(false);
    });

    it("Eキーではシャープ表記を使う", () => {
      expect(shouldPreferFlat("E")).toBe(false);
    });

    it("Bキーではシャープ表記を使う", () => {
      expect(shouldPreferFlat("B")).toBe(false);
    });
  });

  describe("createScale", () => {
    it("Cメジャースケールを生成する", () => {
      const scale = createScale("C", "major");
      expect(scale.root).toEqual(createNote("C"));
      expect(scale.type).toBe("major");
      expect(scale.pattern).toEqual([0, 2, 4, 5, 7, 9, 11]);
      expect(scale.notes).toHaveLength(7);
    });

    it("Cメジャースケールの構成音が C,D,E,F,G,A,B であること", () => {
      const scale = createScale("C", "major");
      const noteNames = scale.notes.map((n) => n.name);
      expect(noteNames).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
    });

    it("Aナチュラルマイナースケールの構成音が A,B,C,D,E,F,G であること", () => {
      const scale = createScale("A", "natural-minor");
      const noteNames = scale.notes.map((n) => n.name);
      expect(noteNames).toEqual(["A", "B", "C", "D", "E", "F", "G"]);
    });

    it("Fメジャースケールでは Bb が使われること（フラット表記）", () => {
      const scale = createScale("F", "major");
      const noteNames = scale.notes.map((n) => n.name);
      expect(noteNames).toEqual(["F", "G", "A", "Bb", "C", "D", "E"]);
    });

    it("Bbメジャースケールでは Eb が使われること", () => {
      const scale = createScale("Bb", "major");
      const noteNames = scale.notes.map((n) => n.name);
      expect(noteNames).toEqual(["Bb", "C", "D", "Eb", "F", "G", "A"]);
    });

    it("Gメジャースケールの構成音が G,A,B,C,D,E,F# であること", () => {
      const scale = createScale("G", "major");
      const noteNames = scale.notes.map((n) => n.name);
      expect(noteNames).toEqual(["G", "A", "B", "C", "D", "E", "F#"]);
    });

    it("Dメジャースケールの構成音が D,E,F#,G,A,B,C# であること", () => {
      const scale = createScale("D", "major");
      const noteNames = scale.notes.map((n) => n.name);
      expect(noteNames).toEqual(["D", "E", "F#", "G", "A", "B", "C#"]);
    });

    it("Ebメジャースケールの構成音が Eb,F,G,Ab,Bb,C,D であること", () => {
      const scale = createScale("Eb", "major");
      const noteNames = scale.notes.map((n) => n.name);
      expect(noteNames).toEqual(["Eb", "F", "G", "Ab", "Bb", "C", "D"]);
    });

    it("Abメジャースケールの構成音が Ab,Bb,C,Db,Eb,F,G であること", () => {
      const scale = createScale("Ab", "major");
      const noteNames = scale.notes.map((n) => n.name);
      expect(noteNames).toEqual(["Ab", "Bb", "C", "Db", "Eb", "F", "G"]);
    });

    it("全12キーでメジャースケールを生成できる", () => {
      const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
      for (const key of keys) {
        const scale = createScale(key, "major");
        expect(scale.notes).toHaveLength(7);
        expect(scale.root.name).toBe(key);
      }
    });

    it("全12キーでフラット系キーからもスケールを生成できる", () => {
      const keys = ["Db", "Eb", "Gb", "Ab", "Bb"];
      for (const key of keys) {
        const scale = createScale(key, "major");
        expect(scale.notes).toHaveLength(7);
        expect(scale.root.name).toBe(key);
      }
    });
  });

  describe("createScale - モードスケール", () => {
    it("Dドリアンスケールの構成音が D,E,F,G,A,B,C であること", () => {
      const scale = createScale("D", "dorian");
      const noteNames = scale.notes.map((n) => n.name);
      expect(noteNames).toEqual(["D", "E", "F", "G", "A", "B", "C"]);
    });

    it("Eフリジアンスケールの構成音が E,F,G,A,B,C,D であること", () => {
      const scale = createScale("E", "phrygian");
      const noteNames = scale.notes.map((n) => n.name);
      expect(noteNames).toEqual(["E", "F", "G", "A", "B", "C", "D"]);
    });

    it("Fリディアンスケールの構成音が F,G,A,B,C,D,E であること", () => {
      const scale = createScale("F", "lydian");
      const noteNames = scale.notes.map((n) => n.name);
      expect(noteNames).toEqual(["F", "G", "A", "B", "C", "D", "E"]);
    });

    it("Gミクソリディアンスケールの構成音が G,A,B,C,D,E,F であること", () => {
      const scale = createScale("G", "mixolydian");
      const noteNames = scale.notes.map((n) => n.name);
      expect(noteNames).toEqual(["G", "A", "B", "C", "D", "E", "F"]);
    });

    it("Aエオリアンスケールの構成音が A,B,C,D,E,F,G であること", () => {
      const scale = createScale("A", "aeolian");
      const noteNames = scale.notes.map((n) => n.name);
      expect(noteNames).toEqual(["A", "B", "C", "D", "E", "F", "G"]);
    });

    it("Bロクリアンスケールの構成音が B,C,D,E,F,G,A であること", () => {
      const scale = createScale("B", "locrian");
      const noteNames = scale.notes.map((n) => n.name);
      expect(noteNames).toEqual(["B", "C", "D", "E", "F", "G", "A"]);
    });

    it("Cハーモニックマイナースケールの構成音が C,D,Eb,F,G,Ab,B であること", () => {
      const scale = createScale("C", "harmonic-minor");
      const noteNames = scale.notes.map((n) => n.name);
      expect(noteNames).toEqual(["C", "D", "Eb", "F", "G", "Ab", "B"]);
    });

    it("Cメロディックマイナースケールの構成音が C,D,Eb,F,G,A,B であること", () => {
      const scale = createScale("C", "melodic-minor");
      const noteNames = scale.notes.map((n) => n.name);
      expect(noteNames).toEqual(["C", "D", "Eb", "F", "G", "A", "B"]);
    });
  });

  describe("getScaleNotes", () => {
    it("Cメジャースケールの構成音を返す", () => {
      const notes = getScaleNotes("C", "major");
      const noteNames = notes.map((n) => n.name);
      expect(noteNames).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
    });

    it("Aナチュラルマイナースケールの構成音を返す", () => {
      const notes = getScaleNotes("A", "natural-minor");
      const noteNames = notes.map((n) => n.name);
      expect(noteNames).toEqual(["A", "B", "C", "D", "E", "F", "G"]);
    });

    it("Fメジャースケールでフラット表記が使われる", () => {
      const notes = getScaleNotes("F", "major");
      const noteNames = notes.map((n) => n.name);
      expect(noteNames).toContain("Bb");
    });
  });

  describe("isNoteInScale", () => {
    it("CはCメジャースケールに含まれる", () => {
      const scale = createScale("C", "major");
      expect(isNoteInScale(createNote("C"), scale)).toBe(true);
    });

    it("EはCメジャースケールに含まれる", () => {
      const scale = createScale("C", "major");
      expect(isNoteInScale(createNote("E"), scale)).toBe(true);
    });

    it("GはCメジャースケールに含まれる", () => {
      const scale = createScale("C", "major");
      expect(isNoteInScale(createNote("G"), scale)).toBe(true);
    });

    it("C#はCメジャースケールに含まれない", () => {
      const scale = createScale("C", "major");
      expect(isNoteInScale(createNote("C#"), scale)).toBe(false);
    });

    it("F#はCメジャースケールに含まれない", () => {
      const scale = createScale("C", "major");
      expect(isNoteInScale(createNote("F#"), scale)).toBe(false);
    });

    it("BbはCメジャースケールに含まれない", () => {
      const scale = createScale("C", "major");
      expect(isNoteInScale(createNote("Bb"), scale)).toBe(false);
    });

    it("異名同音でも判定できる（DbはCメジャースケールに含まれない）", () => {
      const scale = createScale("C", "major");
      expect(isNoteInScale(createNote("Db"), scale)).toBe(false);
    });

    it("BbはFメジャースケールに含まれる", () => {
      const scale = createScale("F", "major");
      expect(isNoteInScale(createNote("Bb"), scale)).toBe(true);
    });

    it("A#はFメジャースケールに含まれる（異名同音）", () => {
      const scale = createScale("F", "major");
      expect(isNoteInScale(createNote("A#"), scale)).toBe(true);
    });

    it("全7音がスケールに含まれると判定される", () => {
      const scale = createScale("C", "major");
      const expected = ["C", "D", "E", "F", "G", "A", "B"];
      for (const name of expected) {
        expect(isNoteInScale(createNote(name), scale)).toBe(true);
      }
    });

    it("スケール外の5音が含まれないと判定される", () => {
      const scale = createScale("C", "major");
      const outside = ["C#", "D#", "F#", "G#", "A#"];
      for (const name of outside) {
        expect(isNoteInScale(createNote(name), scale)).toBe(false);
      }
    });
  });

  describe("getScaleDegreeNote", () => {
    it("Cメジャースケールの第1度はC", () => {
      const scale = createScale("C", "major");
      expect(getScaleDegreeNote(scale, 1).name).toBe("C");
    });

    it("Cメジャースケールの第3度はE", () => {
      const scale = createScale("C", "major");
      expect(getScaleDegreeNote(scale, 3).name).toBe("E");
    });

    it("Cメジャースケールの第5度はG", () => {
      const scale = createScale("C", "major");
      expect(getScaleDegreeNote(scale, 5).name).toBe("G");
    });

    it("Cメジャースケールの第7度はB", () => {
      const scale = createScale("C", "major");
      expect(getScaleDegreeNote(scale, 7).name).toBe("B");
    });

    it("Fメジャースケールの第4度はBb", () => {
      const scale = createScale("F", "major");
      expect(getScaleDegreeNote(scale, 4).name).toBe("Bb");
    });

    it("Aナチュラルマイナースケールの第3度はC", () => {
      const scale = createScale("A", "natural-minor");
      expect(getScaleDegreeNote(scale, 3).name).toBe("C");
    });

    it("degree 0 はエラーを投げる", () => {
      const scale = createScale("C", "major");
      expect(() => getScaleDegreeNote(scale, 0)).toThrow();
    });

    it("degree 8 はエラーを投げる", () => {
      const scale = createScale("C", "major");
      expect(() => getScaleDegreeNote(scale, 8)).toThrow();
    });

    it("負の degree はエラーを投げる", () => {
      const scale = createScale("C", "major");
      expect(() => getScaleDegreeNote(scale, -1)).toThrow();
    });
  });
});
