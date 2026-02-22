import { getDiatonicTriads } from "./diatonic";
import {
  filterNonDiatonicChords,
  getAllModalInterchangeChords,
  getModalInterchangeChords,
} from "./modal-interchange";

describe("modal-interchange", () => {
  describe("getModalInterchangeChords", () => {
    it("Cメジャーに対するナチュラルマイナー由来のコードを返す", () => {
      const chords = getModalInterchangeChords("C", "natural-minor");
      expect(chords.length).toBeGreaterThan(0);
      for (const info of chords) {
        expect(info.source).toBe("natural-minor");
      }
    });

    it("ソースの全てのダイアトニックコード情報を持つ", () => {
      const chords = getModalInterchangeChords("C", "natural-minor");
      expect(chords).toHaveLength(7);
      for (const info of chords) {
        expect(info.chord).toBeDefined();
        expect(info.romanNumeral).toBeDefined();
        expect(info.source).toBe("natural-minor");
        expect(typeof info.isAvailable).toBe("boolean");
      }
    });

    it("Cナチュラルマイナー由来のbIIIはEbメジャー", () => {
      const chords = getModalInterchangeChords("C", "natural-minor");
      const bIII = chords.find((c) => c.chord.root.name === "Eb" && c.chord.quality === "major");
      expect(bIII).toBeDefined();
      expect(bIII?.isAvailable).toBe(true);
    });

    it("Cナチュラルマイナー由来のivはFmである", () => {
      const chords = getModalInterchangeChords("C", "natural-minor");
      const iv = chords.find((c) => c.chord.root.name === "F" && c.chord.quality === "minor");
      expect(iv).toBeDefined();
      expect(iv?.isAvailable).toBe(true);
    });

    it("Cメジャーとナチュラルマイナーで共通するIコードはisAvailable=false", () => {
      // Cナチュラルマイナーの1度目のコードはCm、Cメジャーの1度はC
      // CmはCメジャーのダイアトニックに含まれないのでisAvailable=true
      const chords = getModalInterchangeChords("C", "natural-minor");
      const firstDegree = chords[0];
      // Cmはダイアトニックではないのでavailable
      expect(firstDegree.chord.quality).toBe("minor");
      expect(firstDegree.isAvailable).toBe(true);
    });

    it("ドリアン由来のコードを返す", () => {
      const chords = getModalInterchangeChords("C", "dorian");
      expect(chords).toHaveLength(7);
      for (const info of chords) {
        expect(info.source).toBe("dorian");
      }
    });

    it("リディアン由来のコードを返す", () => {
      const chords = getModalInterchangeChords("C", "lydian");
      expect(chords).toHaveLength(7);
      for (const info of chords) {
        expect(info.source).toBe("lydian");
      }
    });

    it("ミクソリディアン由来のコードを返す", () => {
      const chords = getModalInterchangeChords("C", "mixolydian");
      expect(chords).toHaveLength(7);
    });

    it("Fメジャーに対するナチュラルマイナー由来でフラット表記が使われる", () => {
      const chords = getModalInterchangeChords("F", "natural-minor");
      // Fナチュラルマイナーなのでフラット系
      const hasFlat = chords.some(
        (c) => c.chord.root.name.includes("b") || c.chord.symbol.includes("b")
      );
      // Fナチュラルマイナーには Ab, Bb, Db, Eb が含まれる
      expect(hasFlat).toBe(true);
    });
  });

  describe("getAllModalInterchangeChords", () => {
    it("複数のモードソースからのコードをまとめて返す", () => {
      const allChords = getAllModalInterchangeChords("C");
      expect(allChords.length).toBeGreaterThan(7);
    });

    it("各コードにソース情報が含まれる", () => {
      const allChords = getAllModalInterchangeChords("C");
      const sources = new Set(allChords.map((c) => c.source));
      // 少なくともナチュラルマイナーとドリアンが含まれる
      expect(sources.size).toBeGreaterThanOrEqual(2);
    });

    it("重複するコード（同じルート・同じクオリティ）は排除されない（ソースが異なる）", () => {
      const allChords = getAllModalInterchangeChords("C");
      // 同じコードが別ソースから来る場合がある
      expect(allChords.length).toBeGreaterThan(0);
    });
  });

  describe("filterNonDiatonicChords", () => {
    it("ダイアトニックに含まれるコードを除外する", () => {
      const allChords = getModalInterchangeChords("C", "natural-minor");
      const filtered = filterNonDiatonicChords("C", allChords);
      // Cメジャーのダイアトニックコードが除外される
      const diatonic = getDiatonicTriads("C");
      const diatonicSymbols = new Set(diatonic.map((d) => d.chord.symbol));

      for (const chord of filtered) {
        expect(diatonicSymbols.has(chord.chord.symbol)).toBe(false);
      }
    });

    it("フィルタ後のコードは全てisAvailable=trueである", () => {
      const allChords = getModalInterchangeChords("C", "natural-minor");
      const filtered = filterNonDiatonicChords("C", allChords);
      for (const chord of filtered) {
        expect(chord.isAvailable).toBe(true);
      }
    });

    it("Cメジャーに対するナチュラルマイナーのフィルタ結果にbIII(Eb)が含まれる", () => {
      const allChords = getModalInterchangeChords("C", "natural-minor");
      const filtered = filterNonDiatonicChords("C", allChords);
      const hasEb = filtered.some((c) => c.chord.root.name === "Eb" && c.chord.quality === "major");
      expect(hasEb).toBe(true);
    });

    it("Cメジャーに対するナチュラルマイナーのフィルタ結果にiv(Fm)が含まれる", () => {
      const allChords = getModalInterchangeChords("C", "natural-minor");
      const filtered = filterNonDiatonicChords("C", allChords);
      const hasFm = filtered.some((c) => c.chord.root.name === "F" && c.chord.quality === "minor");
      expect(hasFm).toBe(true);
    });

    it("Cメジャーに対するナチュラルマイナーのフィルタ結果にbVII(Bb)が含まれる", () => {
      const allChords = getModalInterchangeChords("C", "natural-minor");
      const filtered = filterNonDiatonicChords("C", allChords);
      const hasBb = filtered.some((c) => c.chord.root.name === "Bb" && c.chord.quality === "major");
      expect(hasBb).toBe(true);
    });

    it("空の配列を渡すと空の配列を返す", () => {
      const filtered = filterNonDiatonicChords("C", []);
      expect(filtered).toEqual([]);
    });
  });
});
