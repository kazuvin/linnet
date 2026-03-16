import {
  CHORD_INTERVAL_PATTERNS,
  type ChordQuality,
  createChord,
  extendToSeventh,
  formatChordName,
  formatChordSymbol,
  getChordNotes,
  isNoteInChord,
} from "./chord";
import { createNote } from "./note";

describe("chord", () => {
  describe("CHORD_INTERVAL_PATTERNS", () => {
    it("majorは [0, 4, 7]", () => {
      expect(CHORD_INTERVAL_PATTERNS.major).toEqual([0, 4, 7]);
    });

    it("minorは [0, 3, 7]", () => {
      expect(CHORD_INTERVAL_PATTERNS.minor).toEqual([0, 3, 7]);
    });

    it("diminishedは [0, 3, 6]", () => {
      expect(CHORD_INTERVAL_PATTERNS.diminished).toEqual([0, 3, 6]);
    });

    it("augmentedは [0, 4, 8]", () => {
      expect(CHORD_INTERVAL_PATTERNS.augmented).toEqual([0, 4, 8]);
    });

    it("dominant7は [0, 4, 7, 10]", () => {
      expect(CHORD_INTERVAL_PATTERNS.dominant7).toEqual([0, 4, 7, 10]);
    });

    it("major7は [0, 4, 7, 11]", () => {
      expect(CHORD_INTERVAL_PATTERNS.major7).toEqual([0, 4, 7, 11]);
    });

    it("minor7は [0, 3, 7, 10]", () => {
      expect(CHORD_INTERVAL_PATTERNS.minor7).toEqual([0, 3, 7, 10]);
    });

    it("minor7b5は [0, 3, 6, 10]", () => {
      expect(CHORD_INTERVAL_PATTERNS.minor7b5).toEqual([0, 3, 6, 10]);
    });

    it("diminished7は [0, 3, 6, 9]", () => {
      expect(CHORD_INTERVAL_PATTERNS.diminished7).toEqual([0, 3, 6, 9]);
    });

    it("augmented7は [0, 4, 8, 10]", () => {
      expect(CHORD_INTERVAL_PATTERNS.augmented7).toEqual([0, 4, 8, 10]);
    });

    it("全30種類のコードクオリティが定義されている", () => {
      expect(Object.keys(CHORD_INTERVAL_PATTERNS)).toHaveLength(30);
    });

    // 新規追加コード
    it("augmentedMajor7は [0, 4, 8, 11]", () => {
      expect(CHORD_INTERVAL_PATTERNS.augmentedMajor7).toEqual([0, 4, 8, 11]);
    });

    it("dominant7flat5は [0, 4, 6, 10]", () => {
      expect(CHORD_INTERVAL_PATTERNS.dominant7flat5).toEqual([0, 4, 6, 10]);
    });

    it("7sus2は [0, 2, 7, 10]", () => {
      expect(CHORD_INTERVAL_PATTERNS["7sus2"]).toEqual([0, 2, 7, 10]);
    });

    it("dominant11は [0, 2, 4, 5, 7, 10]", () => {
      expect(CHORD_INTERVAL_PATTERNS.dominant11).toEqual([0, 2, 4, 5, 7, 10]);
    });

    it("minor11は [0, 2, 3, 5, 7, 10]", () => {
      expect(CHORD_INTERVAL_PATTERNS.minor11).toEqual([0, 2, 3, 5, 7, 10]);
    });

    it("dominant13は [0, 2, 4, 7, 9, 10]", () => {
      expect(CHORD_INTERVAL_PATTERNS.dominant13).toEqual([0, 2, 4, 7, 9, 10]);
    });

    it("major13は [0, 2, 4, 7, 9, 11]", () => {
      expect(CHORD_INTERVAL_PATTERNS.major13).toEqual([0, 2, 4, 7, 9, 11]);
    });

    it("minor13は [0, 2, 3, 7, 9, 10]", () => {
      expect(CHORD_INTERVAL_PATTERNS.minor13).toEqual([0, 2, 3, 7, 9, 10]);
    });

    // テンションコード・拡張コード
    it("sus2は [0, 2, 7]", () => {
      expect(CHORD_INTERVAL_PATTERNS.sus2).toEqual([0, 2, 7]);
    });

    it("sus4は [0, 5, 7]", () => {
      expect(CHORD_INTERVAL_PATTERNS.sus4).toEqual([0, 5, 7]);
    });

    it("6は [0, 4, 7, 9]", () => {
      expect(CHORD_INTERVAL_PATTERNS["6"]).toEqual([0, 4, 7, 9]);
    });

    it("minor6は [0, 3, 7, 9]", () => {
      expect(CHORD_INTERVAL_PATTERNS.minor6).toEqual([0, 3, 7, 9]);
    });

    it("minorMajor7は [0, 3, 7, 11]", () => {
      expect(CHORD_INTERVAL_PATTERNS.minorMajor7).toEqual([0, 3, 7, 11]);
    });

    it("7sus4は [0, 5, 7, 10]", () => {
      expect(CHORD_INTERVAL_PATTERNS["7sus4"]).toEqual([0, 5, 7, 10]);
    });

    it("add9は [0, 2, 4, 7]", () => {
      expect(CHORD_INTERVAL_PATTERNS.add9).toEqual([0, 2, 4, 7]);
    });

    it("dominant9は [0, 2, 4, 7, 10]", () => {
      expect(CHORD_INTERVAL_PATTERNS.dominant9).toEqual([0, 2, 4, 7, 10]);
    });

    it("major9は [0, 2, 4, 7, 11]", () => {
      expect(CHORD_INTERVAL_PATTERNS.major9).toEqual([0, 2, 4, 7, 11]);
    });

    it("minor9は [0, 2, 3, 7, 10]", () => {
      expect(CHORD_INTERVAL_PATTERNS.minor9).toEqual([0, 2, 3, 7, 10]);
    });

    it("dominant7sharp9は [0, 3, 4, 7, 10]", () => {
      expect(CHORD_INTERVAL_PATTERNS.dominant7sharp9).toEqual([0, 3, 4, 7, 10]);
    });

    it("dominant7flat9は [0, 1, 4, 7, 10]", () => {
      expect(CHORD_INTERVAL_PATTERNS.dominant7flat9).toEqual([0, 1, 4, 7, 10]);
    });
  });

  describe("getChordNotes", () => {
    it("Cメジャーの構成音は C, E, G", () => {
      const notes = getChordNotes("C", "major");
      expect(notes.map((n) => n.name)).toEqual(["C", "E", "G"]);
    });

    it("Aマイナーの構成音は A, C, E", () => {
      const notes = getChordNotes("A", "minor");
      expect(notes.map((n) => n.name)).toEqual(["A", "C", "E"]);
    });

    it("Cm7の構成音は C, Eb, G, Bb", () => {
      const notes = getChordNotes("C", "minor7", true);
      expect(notes.map((n) => n.name)).toEqual(["C", "Eb", "G", "Bb"]);
    });

    it("Gメジャーの構成音は G, B, D", () => {
      const notes = getChordNotes("G", "major");
      expect(notes.map((n) => n.name)).toEqual(["G", "B", "D"]);
    });

    it("Fマイナーの構成音は F, Ab, C", () => {
      const notes = getChordNotes("F", "minor", true);
      expect(notes.map((n) => n.name)).toEqual(["F", "Ab", "C"]);
    });

    it("Bディミニッシュの構成音は B, D, F", () => {
      const notes = getChordNotes("B", "diminished");
      expect(notes.map((n) => n.name)).toEqual(["B", "D", "F"]);
    });

    it("Cオーグメントの構成音は C, E, G#", () => {
      const notes = getChordNotes("C", "augmented");
      expect(notes.map((n) => n.name)).toEqual(["C", "E", "G#"]);
    });

    it("G7の構成音は G, B, D, F", () => {
      const notes = getChordNotes("G", "dominant7");
      expect(notes.map((n) => n.name)).toEqual(["G", "B", "D", "F"]);
    });

    it("CM7の構成音は C, E, G, B", () => {
      const notes = getChordNotes("C", "major7");
      expect(notes.map((n) => n.name)).toEqual(["C", "E", "G", "B"]);
    });

    it("Bm7b5の構成音は B, D, F, A", () => {
      const notes = getChordNotes("B", "minor7b5");
      expect(notes.map((n) => n.name)).toEqual(["B", "D", "F", "A"]);
    });

    it("Cdim7の構成音は C, Eb, Gb, A", () => {
      const notes = getChordNotes("C", "diminished7", true);
      expect(notes.map((n) => n.name)).toEqual(["C", "Eb", "Gb", "A"]);
    });

    it("Caug7の構成音は C, E, G#, A#", () => {
      const notes = getChordNotes("C", "augmented7");
      expect(notes.map((n) => n.name)).toEqual(["C", "E", "G#", "A#"]);
    });

    it("Bbメジャーの構成音は Bb, D, F（フラット系キー）", () => {
      const notes = getChordNotes("Bb", "major", true);
      expect(notes.map((n) => n.name)).toEqual(["Bb", "D", "F"]);
    });

    it("Ebメジャーの構成音は Eb, G, Bb（フラット系キー）", () => {
      const notes = getChordNotes("Eb", "major", true);
      expect(notes.map((n) => n.name)).toEqual(["Eb", "G", "Bb"]);
    });

    it("構成音のピッチクラスが正しい", () => {
      const notes = getChordNotes("C", "major");
      expect(notes.map((n) => n.pitchClass)).toEqual([0, 4, 7]);
    });

    // テンションコード構成音
    it("Csus2の構成音は C, D, G", () => {
      const notes = getChordNotes("C", "sus2");
      expect(notes.map((n) => n.name)).toEqual(["C", "D", "G"]);
    });

    it("Csus4の構成音は C, F, G", () => {
      const notes = getChordNotes("C", "sus4");
      expect(notes.map((n) => n.name)).toEqual(["C", "F", "G"]);
    });

    it("C6の構成音は C, E, G, A", () => {
      const notes = getChordNotes("C", "6");
      expect(notes.map((n) => n.name)).toEqual(["C", "E", "G", "A"]);
    });

    it("Cm6の構成音は C, Eb, G, A", () => {
      const notes = getChordNotes("C", "minor6", true);
      expect(notes.map((n) => n.name)).toEqual(["C", "Eb", "G", "A"]);
    });

    it("CmM7の構成音は C, Eb, G, B", () => {
      const notes = getChordNotes("C", "minorMajor7", true);
      expect(notes.map((n) => n.name)).toEqual(["C", "Eb", "G", "B"]);
    });

    it("C7sus4の構成音は C, F, G, Bb", () => {
      const notes = getChordNotes("C", "7sus4", true);
      expect(notes.map((n) => n.name)).toEqual(["C", "F", "G", "Bb"]);
    });

    it("Cadd9の構成音は C, D, E, G", () => {
      const notes = getChordNotes("C", "add9");
      expect(notes.map((n) => n.name)).toEqual(["C", "D", "E", "G"]);
    });

    it("C9の構成音は C, D, E, G, A#", () => {
      const notes = getChordNotes("C", "dominant9");
      expect(notes.map((n) => n.name)).toEqual(["C", "D", "E", "G", "A#"]);
    });

    it("CM9の構成音は C, D, E, G, B", () => {
      const notes = getChordNotes("C", "major9");
      expect(notes.map((n) => n.name)).toEqual(["C", "D", "E", "G", "B"]);
    });

    it("Cm9の構成音は C, D, Eb, G, Bb", () => {
      const notes = getChordNotes("C", "minor9", true);
      expect(notes.map((n) => n.name)).toEqual(["C", "D", "Eb", "G", "Bb"]);
    });

    it("C7(#9)の構成音は C, D#, E, G, A#", () => {
      const notes = getChordNotes("C", "dominant7sharp9");
      expect(notes.map((n) => n.name)).toEqual(["C", "D#", "E", "G", "A#"]);
    });

    it("C7(b9)の構成音は C, Db, E, G, Bb", () => {
      const notes = getChordNotes("C", "dominant7flat9", true);
      expect(notes.map((n) => n.name)).toEqual(["C", "Db", "E", "G", "Bb"]);
    });
  });

  describe("createChord", () => {
    it("Cメジャーコードを生成する", () => {
      const chord = createChord("C", "major");
      expect(chord.root).toEqual({ pitchClass: 0, name: "C" });
      expect(chord.quality).toBe("major");
      expect(chord.notes.map((n) => n.name)).toEqual(["C", "E", "G"]);
      expect(chord.name).toBe("C major");
      expect(chord.symbol).toBe("C");
    });

    it("Amマイナーコードを生成する", () => {
      const chord = createChord("A", "minor");
      expect(chord.root).toEqual({ pitchClass: 9, name: "A" });
      expect(chord.quality).toBe("minor");
      expect(chord.notes.map((n) => n.name)).toEqual(["A", "C", "E"]);
      expect(chord.name).toBe("A minor");
      expect(chord.symbol).toBe("Am");
    });

    it("Cm7コードを生成する", () => {
      const chord = createChord("C", "minor7", true);
      expect(chord.notes.map((n) => n.name)).toEqual(["C", "Eb", "G", "Bb"]);
      expect(chord.name).toBe("C minor7");
      expect(chord.symbol).toBe("Cm7");
    });

    it("Bbメジャーコードをフラット系で生成する", () => {
      const chord = createChord("Bb", "major", true);
      expect(chord.root.name).toBe("Bb");
      expect(chord.notes.map((n) => n.name)).toEqual(["Bb", "D", "F"]);
      expect(chord.symbol).toBe("Bb");
    });

    it("全ChordQualityで生成できる", () => {
      const qualities: ChordQuality[] = [
        "major",
        "minor",
        "diminished",
        "augmented",
        "dominant7",
        "major7",
        "minor7",
        "minor7b5",
        "diminished7",
        "augmented7",
        "augmentedMajor7",
        "sus2",
        "sus4",
        "6",
        "minor6",
        "minorMajor7",
        "7sus2",
        "7sus4",
        "add9",
        "dominant9",
        "major9",
        "minor9",
        "dominant7sharp9",
        "dominant7flat9",
        "dominant7flat5",
        "dominant11",
        "minor11",
        "dominant13",
        "major13",
        "minor13",
      ];
      for (const quality of qualities) {
        const chord = createChord("C", quality);
        expect(chord.quality).toBe(quality);
        expect(chord.notes.length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe("formatChordName", () => {
    it("Cメジャーのフルネームは 'C major'", () => {
      expect(formatChordName("C", "major")).toBe("C major");
    });

    it("Aマイナーのフルネームは 'A minor'", () => {
      expect(formatChordName("A", "minor")).toBe("A minor");
    });

    it("Cディミニッシュのフルネームは 'C diminished'", () => {
      expect(formatChordName("C", "diminished")).toBe("C diminished");
    });

    it("Cドミナント7のフルネームは 'C dominant7'", () => {
      expect(formatChordName("C", "dominant7")).toBe("C dominant7");
    });

    it("Bbマイナー7のフルネームは 'Bb minor7'", () => {
      expect(formatChordName("Bb", "minor7")).toBe("Bb minor7");
    });
  });

  describe("formatChordSymbol", () => {
    it("majorのシンボルはルート名のみ", () => {
      expect(formatChordSymbol("C", "major")).toBe("C");
    });

    it("minorのシンボルは 'Cm'", () => {
      expect(formatChordSymbol("C", "minor")).toBe("Cm");
    });

    it("diminishedのシンボルは 'Cdim'", () => {
      expect(formatChordSymbol("C", "diminished")).toBe("Cdim");
    });

    it("augmentedのシンボルは 'Caug'", () => {
      expect(formatChordSymbol("C", "augmented")).toBe("Caug");
    });

    it("dominant7のシンボルは 'C7'", () => {
      expect(formatChordSymbol("C", "dominant7")).toBe("C7");
    });

    it("major7のシンボルは 'CM7'", () => {
      expect(formatChordSymbol("C", "major7")).toBe("CM7");
    });

    it("minor7のシンボルは 'Cm7'", () => {
      expect(formatChordSymbol("C", "minor7")).toBe("Cm7");
    });

    it("minor7b5のシンボルは 'Cm7(b5)'", () => {
      expect(formatChordSymbol("C", "minor7b5")).toBe("Cm7(b5)");
    });

    it("diminished7のシンボルは 'Cdim7'", () => {
      expect(formatChordSymbol("C", "diminished7")).toBe("Cdim7");
    });

    it("augmented7のシンボルは 'Caug7'", () => {
      expect(formatChordSymbol("C", "augmented7")).toBe("Caug7");
    });

    it("Bbルートでmajorのシンボルは 'Bb'", () => {
      expect(formatChordSymbol("Bb", "major")).toBe("Bb");
    });

    it("F#ルートでminorのシンボルは 'F#m'", () => {
      expect(formatChordSymbol("F#", "minor")).toBe("F#m");
    });

    it("Ebルートでminor7のシンボルは 'Ebm7'", () => {
      expect(formatChordSymbol("Eb", "minor7")).toBe("Ebm7");
    });

    // テンションコードシンボル
    it("sus2のシンボルは 'Csus2'", () => {
      expect(formatChordSymbol("C", "sus2")).toBe("Csus2");
    });

    it("sus4のシンボルは 'Csus4'", () => {
      expect(formatChordSymbol("C", "sus4")).toBe("Csus4");
    });

    it("6のシンボルは 'C6'", () => {
      expect(formatChordSymbol("C", "6")).toBe("C6");
    });

    it("minor6のシンボルは 'Cm6'", () => {
      expect(formatChordSymbol("C", "minor6")).toBe("Cm6");
    });

    it("minorMajor7のシンボルは 'CmM7'", () => {
      expect(formatChordSymbol("C", "minorMajor7")).toBe("CmM7");
    });

    it("7sus4のシンボルは 'C7sus4'", () => {
      expect(formatChordSymbol("C", "7sus4")).toBe("C7sus4");
    });

    it("add9のシンボルは 'Cadd9'", () => {
      expect(formatChordSymbol("C", "add9")).toBe("Cadd9");
    });

    it("dominant9のシンボルは 'C9'", () => {
      expect(formatChordSymbol("C", "dominant9")).toBe("C9");
    });

    it("major9のシンボルは 'CM9'", () => {
      expect(formatChordSymbol("C", "major9")).toBe("CM9");
    });

    it("minor9のシンボルは 'Cm9'", () => {
      expect(formatChordSymbol("C", "minor9")).toBe("Cm9");
    });

    it("dominant7sharp9のシンボルは 'C7(#9)'", () => {
      expect(formatChordSymbol("C", "dominant7sharp9")).toBe("C7(#9)");
    });

    it("dominant7flat9のシンボルは 'C7(b9)'", () => {
      expect(formatChordSymbol("C", "dominant7flat9")).toBe("C7(b9)");
    });
  });

  describe("isNoteInChord", () => {
    it("CはCメジャーコードに含まれる", () => {
      const chord = createChord("C", "major");
      expect(isNoteInChord(createNote("C"), chord)).toBe(true);
    });

    it("EはCメジャーコードに含まれる", () => {
      const chord = createChord("C", "major");
      expect(isNoteInChord(createNote("E"), chord)).toBe(true);
    });

    it("GはCメジャーコードに含まれる", () => {
      const chord = createChord("C", "major");
      expect(isNoteInChord(createNote("G"), chord)).toBe(true);
    });

    it("DはCメジャーコードに含まれない", () => {
      const chord = createChord("C", "major");
      expect(isNoteInChord(createNote("D"), chord)).toBe(false);
    });

    it("FはCメジャーコードに含まれない", () => {
      const chord = createChord("C", "major");
      expect(isNoteInChord(createNote("F"), chord)).toBe(false);
    });

    it("異名同音でも含まれると判定する（DbはC#と同じピッチクラス）", () => {
      const chord = createChord("A", "major"); // A, C#, E
      expect(isNoteInChord(createNote("Db"), chord)).toBe(true);
    });

    it("7thコードの4音全てに対して正しく判定する", () => {
      const chord = createChord("C", "minor7", true);
      expect(isNoteInChord(createNote("C"), chord)).toBe(true);
      expect(isNoteInChord(createNote("Eb"), chord)).toBe(true);
      expect(isNoteInChord(createNote("G"), chord)).toBe(true);
      expect(isNoteInChord(createNote("Bb"), chord)).toBe(true);
      expect(isNoteInChord(createNote("F"), chord)).toBe(false);
    });
  });

  describe("extendToSeventh", () => {
    it("majorをmajor7に拡張する", () => {
      const chord = extendToSeventh("C", "major");
      expect(chord.quality).toBe("major7");
      expect(chord.notes.map((n) => n.name)).toEqual(["C", "E", "G", "B"]);
      expect(chord.symbol).toBe("CM7");
    });

    it("minorをminor7に拡張する", () => {
      const chord = extendToSeventh("A", "minor");
      expect(chord.quality).toBe("minor7");
      expect(chord.notes.map((n) => n.name)).toEqual(["A", "C", "E", "G"]);
      expect(chord.symbol).toBe("Am7");
    });

    it("diminishedをminor7b5に拡張する", () => {
      const chord = extendToSeventh("B", "diminished");
      expect(chord.quality).toBe("minor7b5");
      expect(chord.notes.map((n) => n.name)).toEqual(["B", "D", "F", "A"]);
      expect(chord.symbol).toBe("Bm7(b5)");
    });

    it("augmentedをaugmented7に拡張する", () => {
      const chord = extendToSeventh("C", "augmented");
      expect(chord.quality).toBe("augmented7");
      expect(chord.notes.map((n) => n.name)).toEqual(["C", "E", "G#", "A#"]);
      expect(chord.symbol).toBe("Caug7");
    });

    it("Bbメジャーをフラット系でmajor7に拡張する", () => {
      const chord = extendToSeventh("Bb", "major", true);
      expect(chord.quality).toBe("major7");
      expect(chord.notes.map((n) => n.name)).toEqual(["Bb", "D", "F", "A"]);
      expect(chord.symbol).toBe("BbM7");
    });

    it("すでに7thコードの場合はそのまま返す", () => {
      const chord = extendToSeventh("C", "dominant7");
      expect(chord.quality).toBe("dominant7");
      expect(chord.notes.map((n) => n.name)).toEqual(["C", "E", "G", "A#"]);
    });

    it("minor7を渡した場合もそのまま返す", () => {
      const chord = extendToSeventh("C", "minor7", true);
      expect(chord.quality).toBe("minor7");
    });

    it("sus4を7sus4に拡張する", () => {
      const chord = extendToSeventh("C", "sus4", true);
      expect(chord.quality).toBe("7sus4");
      expect(chord.notes.map((n) => n.name)).toEqual(["C", "F", "G", "Bb"]);
    });
  });
});
