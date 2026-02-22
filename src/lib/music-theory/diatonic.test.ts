import {
  formatRomanNumeral,
  getChordFunction,
  getDiatonicChords,
  getDiatonicSevenths,
  getDiatonicTriads,
} from "./diatonic";

describe("diatonic", () => {
  describe("getChordFunction", () => {
    it("1度はtonic", () => {
      expect(getChordFunction(1)).toBe("tonic");
    });

    it("2度はsubdominant", () => {
      expect(getChordFunction(2)).toBe("subdominant");
    });

    it("3度はtonic", () => {
      expect(getChordFunction(3)).toBe("tonic");
    });

    it("4度はsubdominant", () => {
      expect(getChordFunction(4)).toBe("subdominant");
    });

    it("5度はdominant", () => {
      expect(getChordFunction(5)).toBe("dominant");
    });

    it("6度はtonic", () => {
      expect(getChordFunction(6)).toBe("tonic");
    });

    it("7度はdominant", () => {
      expect(getChordFunction(7)).toBe("dominant");
    });

    it("範囲外の度数でエラーを投げる", () => {
      expect(() => getChordFunction(0)).toThrow();
      expect(() => getChordFunction(8)).toThrow();
    });
  });

  describe("formatRomanNumeral", () => {
    describe("トライアド", () => {
      it("1度 major は I", () => {
        expect(formatRomanNumeral(1, "major")).toBe("I");
      });

      it("2度 minor は ii", () => {
        expect(formatRomanNumeral(2, "minor")).toBe("ii");
      });

      it("3度 minor は iii", () => {
        expect(formatRomanNumeral(3, "minor")).toBe("iii");
      });

      it("4度 major は IV", () => {
        expect(formatRomanNumeral(4, "major")).toBe("IV");
      });

      it("5度 major は V", () => {
        expect(formatRomanNumeral(5, "major")).toBe("V");
      });

      it("6度 minor は vi", () => {
        expect(formatRomanNumeral(6, "minor")).toBe("vi");
      });

      it("7度 diminished は vii°", () => {
        expect(formatRomanNumeral(7, "diminished")).toBe("vii\u00B0");
      });
    });

    describe("7thコード", () => {
      it("1度 major7 は IM7", () => {
        expect(formatRomanNumeral(1, "major7")).toBe("IM7");
      });

      it("2度 minor7 は iim7", () => {
        expect(formatRomanNumeral(2, "minor7")).toBe("iim7");
      });

      it("3度 minor7 は iiim7", () => {
        expect(formatRomanNumeral(3, "minor7")).toBe("iiim7");
      });

      it("4度 major7 は IVM7", () => {
        expect(formatRomanNumeral(4, "major7")).toBe("IVM7");
      });

      it("5度 dominant7 は V7", () => {
        expect(formatRomanNumeral(5, "dominant7")).toBe("V7");
      });

      it("6度 minor7 は vim7", () => {
        expect(formatRomanNumeral(6, "minor7")).toBe("vim7");
      });

      it("7度 minor7b5 は viim7(b5)", () => {
        expect(formatRomanNumeral(7, "minor7b5")).toBe("viim7(b5)");
      });
    });

    describe("その他のクオリティ", () => {
      it("augmented は大文字 + +", () => {
        expect(formatRomanNumeral(3, "augmented")).toBe("III+");
      });

      it("augmented7 は大文字 + +7", () => {
        expect(formatRomanNumeral(3, "augmented7")).toBe("III+7");
      });

      it("diminished7 は小文字 + dim7", () => {
        expect(formatRomanNumeral(7, "diminished7")).toBe("viidim7");
      });
    });
  });

  describe("getDiatonicTriads", () => {
    it("7つのコードを返す", () => {
      const chords = getDiatonicTriads("C");
      expect(chords).toHaveLength(7);
    });

    it("Cメジャーのダイアトニックトライアドを返す", () => {
      const chords = getDiatonicTriads("C");
      const symbols = chords.map((c) => c.chord.symbol);
      expect(symbols).toEqual(["C", "Dm", "Em", "F", "G", "Am", "Bdim"]);
    });

    it("各コードのdegreeが1から7", () => {
      const chords = getDiatonicTriads("C");
      expect(chords.map((c) => c.degree)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it("各コードのローマ数字が正しい", () => {
      const chords = getDiatonicTriads("C");
      const numerals = chords.map((c) => c.romanNumeral);
      expect(numerals).toEqual(["I", "ii", "iii", "IV", "V", "vi", "vii\u00B0"]);
    });

    it("各コードの機能が正しい", () => {
      const chords = getDiatonicTriads("C");
      const functions = chords.map((c) => c.chordFunction);
      expect(functions).toEqual([
        "tonic",
        "subdominant",
        "tonic",
        "subdominant",
        "dominant",
        "tonic",
        "dominant",
      ]);
    });

    it("Fメジャーのダイアトニックトライアドを返す（Bbが含まれる）", () => {
      const chords = getDiatonicTriads("F");
      const symbols = chords.map((c) => c.chord.symbol);
      expect(symbols).toEqual(["F", "Gm", "Am", "Bb", "C", "Dm", "Edim"]);
    });

    it("Bbメジャーのダイアトニックトライアドを返す", () => {
      const chords = getDiatonicTriads("Bb");
      const symbols = chords.map((c) => c.chord.symbol);
      expect(symbols).toEqual(["Bb", "Cm", "Dm", "Eb", "F", "Gm", "Adim"]);
    });
  });

  describe("getDiatonicSevenths", () => {
    it("7つのコードを返す", () => {
      const chords = getDiatonicSevenths("C");
      expect(chords).toHaveLength(7);
    });

    it("Cメジャーのダイアトニック7thコードを返す", () => {
      const chords = getDiatonicSevenths("C");
      const symbols = chords.map((c) => c.chord.symbol);
      expect(symbols).toEqual(["CM7", "Dm7", "Em7", "FM7", "G7", "Am7", "Bm7(b5)"]);
    });

    it("各コードのローマ数字が正しい", () => {
      const chords = getDiatonicSevenths("C");
      const numerals = chords.map((c) => c.romanNumeral);
      expect(numerals).toEqual(["IM7", "iim7", "iiim7", "IVM7", "V7", "vim7", "viim7(b5)"]);
    });

    it("Fメジャーのダイアトニック7thコードを返す", () => {
      const chords = getDiatonicSevenths("F");
      const symbols = chords.map((c) => c.chord.symbol);
      expect(symbols).toEqual(["FM7", "Gm7", "Am7", "BbM7", "C7", "Dm7", "Em7(b5)"]);
    });

    it("Bbメジャーのダイアトニック7thコードを返す", () => {
      const chords = getDiatonicSevenths("Bb");
      const symbols = chords.map((c) => c.chord.symbol);
      expect(symbols).toEqual(["BbM7", "Cm7", "Dm7", "EbM7", "F7", "Gm7", "Am7(b5)"]);
    });
  });

  describe("getDiatonicChords", () => {
    it("seventh省略時はトライアドを返す", () => {
      const chords = getDiatonicChords("C");
      const symbols = chords.map((c) => c.chord.symbol);
      expect(symbols).toEqual(["C", "Dm", "Em", "F", "G", "Am", "Bdim"]);
    });

    it("seventh=falseでトライアドを返す", () => {
      const chords = getDiatonicChords("C", false);
      const symbols = chords.map((c) => c.chord.symbol);
      expect(symbols).toEqual(["C", "Dm", "Em", "F", "G", "Am", "Bdim"]);
    });

    it("seventh=trueで7thコードを返す", () => {
      const chords = getDiatonicChords("C", true);
      const symbols = chords.map((c) => c.chord.symbol);
      expect(symbols).toEqual(["CM7", "Dm7", "Em7", "FM7", "G7", "Am7", "Bm7(b5)"]);
    });
  });
});
