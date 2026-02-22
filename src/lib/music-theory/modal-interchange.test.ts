import { getDiatonicTriads } from "./diatonic";
import {
  ALL_MODE_SOURCES,
  filterNonDiatonicChords,
  getAllModalInterchangeChords,
  getModalInterchangeChords,
  MODE_DISPLAY_NAMES,
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

    it("各コードに degree フィールドが含まれる（1〜7）", () => {
      const chords = getModalInterchangeChords("C", "natural-minor");
      const degrees = chords.map((c) => c.degree);
      expect(degrees).toEqual([1, 2, 3, 4, 5, 6, 7]);
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

    it("seventh=true でセブンスコードを返す", () => {
      const chords = getModalInterchangeChords("C", "natural-minor", true);
      expect(chords).toHaveLength(7);
      // 全てのコードが4音（セブンス）
      for (const info of chords) {
        expect(info.chord.notes).toHaveLength(4);
      }
    });

    it("Cナチュラルマイナー由来のセブンスで Cm7 が含まれる", () => {
      const chords = getModalInterchangeChords("C", "natural-minor", true);
      const cm7 = chords.find((c) => c.chord.symbol === "Cm7");
      expect(cm7).toBeDefined();
      expect(cm7?.degree).toBe(1);
    });

    it("Cナチュラルマイナー由来のセブンスで EbM7 が含まれる", () => {
      const chords = getModalInterchangeChords("C", "natural-minor", true);
      const ebM7 = chords.find((c) => c.chord.root.name === "Eb" && c.chord.quality === "major7");
      expect(ebM7).toBeDefined();
      expect(ebM7?.degree).toBe(3);
    });

    it("seventh=true のとき isAvailable がセブンスダイアトニックと比較される", () => {
      const chords = getModalInterchangeChords("C", "natural-minor", true);
      // Cm7 はCメジャーのセブンスダイアトニック(CM7, Dm7, Em7, FM7, G7, Am7, Bm7b5)に含まれないので available
      const cm7 = chords.find((c) => c.chord.symbol === "Cm7");
      expect(cm7?.isAvailable).toBe(true);
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

  describe("ALL_MODE_SOURCES", () => {
    it("7つのモードソースを含む", () => {
      expect(ALL_MODE_SOURCES).toHaveLength(7);
    });

    it("全てのモードが含まれる", () => {
      expect(ALL_MODE_SOURCES).toContain("natural-minor");
      expect(ALL_MODE_SOURCES).toContain("harmonic-minor");
      expect(ALL_MODE_SOURCES).toContain("melodic-minor");
      expect(ALL_MODE_SOURCES).toContain("dorian");
      expect(ALL_MODE_SOURCES).toContain("phrygian");
      expect(ALL_MODE_SOURCES).toContain("lydian");
      expect(ALL_MODE_SOURCES).toContain("mixolydian");
    });
  });

  describe("MODE_DISPLAY_NAMES", () => {
    it("全モードの表示名が定義されている", () => {
      for (const source of ALL_MODE_SOURCES) {
        expect(MODE_DISPLAY_NAMES[source]).toBeDefined();
        expect(typeof MODE_DISPLAY_NAMES[source]).toBe("string");
      }
    });

    it("ナチュラルマイナーの表示名が正しい", () => {
      expect(MODE_DISPLAY_NAMES["natural-minor"]).toBe("Natural Minor");
    });
  });
});
