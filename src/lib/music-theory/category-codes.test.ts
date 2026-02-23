import { ALL_CATEGORY_IDS, CATEGORY_DISPLAY_NAMES, getCategoryChords } from "./category-codes";

describe("category-codes", () => {
  describe("ALL_CATEGORY_IDS", () => {
    it("neo-soulを含む", () => {
      expect(ALL_CATEGORY_IDS).toContain("neo-soul");
    });
  });

  describe("CATEGORY_DISPLAY_NAMES", () => {
    it("全てのカテゴリIDに表示名がある", () => {
      for (const id of ALL_CATEGORY_IDS) {
        expect(CATEGORY_DISPLAY_NAMES[id]).toBeDefined();
      }
    });

    it("neo-soulの表示名が正しい", () => {
      expect(CATEGORY_DISPLAY_NAMES["neo-soul"]).toBe("Neo Soul");
    });
  });

  describe("getCategoryChords", () => {
    describe("neo-soul トライアド（Cメジャー）", () => {
      it("度数でソートされている", () => {
        const chords = getCategoryChords("C", "neo-soul");
        const degrees = chords.map((c) => c.degree);
        const sorted = [...degrees].sort((a, b) => a - b);
        expect(degrees).toEqual(sorted);
      });

      it("同じ度数に複数のコードが存在する", () => {
        const chords = getCategoryChords("C", "neo-soul");
        const degree2Chords = chords.filter((c) => c.degree === 2);
        // ii (diatonic minor) と II (secondary dominant major)
        expect(degree2Chords.length).toBeGreaterThanOrEqual(2);
      });

      it("ダイアトニックコードを含む", () => {
        const chords = getCategoryChords("C", "neo-soul");
        const diatonicChords = chords.filter((c) => c.source === "diatonic");
        expect(diatonicChords.length).toBeGreaterThan(0);
      });

      it("モーダルインターチェンジコードを含む", () => {
        const chords = getCategoryChords("C", "neo-soul");
        const sources = chords.map((c) => c.source);
        // natural-minor, dorian, mixolydian からの借用コード
        expect(sources).toContain("natural-minor");
        expect(sources).toContain("mixolydian");
      });

      it("セカンダリードミナントを含む", () => {
        const chords = getCategoryChords("C", "neo-soul");
        const sdChords = chords.filter((c) => c.source === "secondary-dominant");
        expect(sdChords.length).toBeGreaterThan(0);
      });

      it("各コードにsource（借用元）が設定されている", () => {
        const chords = getCategoryChords("C", "neo-soul");
        for (const chord of chords) {
          expect(chord.source).toBeDefined();
          expect(typeof chord.source).toBe("string");
        }
      });

      it("各コードにchordFunctionが設定されている", () => {
        const chords = getCategoryChords("C", "neo-soul");
        for (const chord of chords) {
          expect(["tonic", "subdominant", "dominant"]).toContain(chord.chordFunction);
        }
      });

      it("Cメジャーでの具体的なコード", () => {
        const chords = getCategoryChords("C", "neo-soul");
        const symbols = chords.map((c) => c.chord.symbol);

        // ダイアトニック: C, Dm, Em, F, G, Am
        expect(symbols).toContain("C");
        expect(symbols).toContain("Dm");
        expect(symbols).toContain("Em");
        expect(symbols).toContain("F");
        expect(symbols).toContain("G");
        expect(symbols).toContain("Am");

        // モーダルインターチェンジ: Eb (bIII), Fm (iv), Ab (bVI), Bb (bVII)
        expect(symbols).toContain("Eb");
        expect(symbols).toContain("Fm");
        expect(symbols).toContain("Ab");
        expect(symbols).toContain("Bb");

        // セカンダリードミナント: D (II)
        expect(symbols).toContain("D");
      });

      it("bIIIコードのsourceがnatural-minor", () => {
        const chords = getCategoryChords("C", "neo-soul");
        const bIII = chords.find((c) => c.chord.symbol === "Eb");
        expect(bIII).toBeDefined();
        expect(bIII?.source).toBe("natural-minor");
        expect(bIII?.degree).toBe(3);
      });

      it("ivコードのsourceがdorian", () => {
        const chords = getCategoryChords("C", "neo-soul");
        const iv = chords.find((c) => c.chord.symbol === "Fm");
        expect(iv).toBeDefined();
        expect(iv?.source).toBe("dorian");
        expect(iv?.degree).toBe(4);
      });

      it("bVIIコードのsourceがmixolydian", () => {
        const chords = getCategoryChords("C", "neo-soul");
        const bVII = chords.find((c) => c.chord.symbol === "Bb");
        expect(bVII).toBeDefined();
        expect(bVII?.source).toBe("mixolydian");
        expect(bVII?.degree).toBe(7);
      });

      it("IIコード（セカンダリードミナント）のchordFunctionがdominant", () => {
        const chords = getCategoryChords("C", "neo-soul");
        const II = chords.find((c) => c.chord.symbol === "D" && c.source === "secondary-dominant");
        expect(II).toBeDefined();
        expect(II?.chordFunction).toBe("dominant");
      });
    });

    describe("neo-soul セブンス（Cメジャー）", () => {
      it("セブンスコードが生成される", () => {
        const chords = getCategoryChords("C", "neo-soul", true);
        const qualities = chords.map((c) => c.chord.quality);
        // セブンス系のクオリティを含む
        expect(qualities.some((q) => q.includes("7"))).toBe(true);
      });

      it("Cメジャーでの具体的なセブンスコード", () => {
        const chords = getCategoryChords("C", "neo-soul", true);
        const symbols = chords.map((c) => c.chord.symbol);

        // ダイアトニック7th: CM7, Dm7, Em7, FM7, G7, Am7
        expect(symbols).toContain("CM7");
        expect(symbols).toContain("Dm7");
        expect(symbols).toContain("Em7");
        expect(symbols).toContain("FM7");
        expect(symbols).toContain("G7");
        expect(symbols).toContain("Am7");

        // モーダルインターチェンジ7th: EbM7, Fm7, AbM7
        expect(symbols).toContain("EbM7");
        expect(symbols).toContain("Fm7");
        expect(symbols).toContain("AbM7");

        // bVII7: Bb7 (dominant7)
        expect(symbols).toContain("Bb7");

        // セカンダリードミナント7th: D7 (II7)
        expect(symbols).toContain("D7");
      });
    });

    describe("異なるキーでのトランスポーズ", () => {
      it("Gメジャーでの neo-soul トライアド", () => {
        const chords = getCategoryChords("G", "neo-soul");
        const symbols = chords.map((c) => c.chord.symbol);

        // ダイアトニック: G, Am, Bm, C, D, Em
        expect(symbols).toContain("G");
        expect(symbols).toContain("Am");
        expect(symbols).toContain("Bm");
        expect(symbols).toContain("C");
        expect(symbols).toContain("D");
        expect(symbols).toContain("Em");

        // モーダルインターチェンジ: Bb (bIII), Cm (iv), Eb (bVI), F (bVII)
        expect(symbols).toContain("Bb");
        expect(symbols).toContain("Cm");
        expect(symbols).toContain("Eb");
        expect(symbols).toContain("F");

        // セカンダリードミナント: A (II = V/V)
        expect(symbols).toContain("A");
      });

      it("Fメジャーでの neo-soul トライアド（フラット系キー）", () => {
        const chords = getCategoryChords("F", "neo-soul");
        const symbols = chords.map((c) => c.chord.symbol);

        // ダイアトニック: F, Gm, Am, Bb, C, Dm
        expect(symbols).toContain("F");
        expect(symbols).toContain("Gm");
        expect(symbols).toContain("Am");
        expect(symbols).toContain("Bb");
        expect(symbols).toContain("C");
        expect(symbols).toContain("Dm");

        // モーダルインターチェンジ: Ab (bIII), Bbm (iv), Db (bVI), Eb (bVII)
        expect(symbols).toContain("Ab");
        expect(symbols).toContain("Bbm");
        expect(symbols).toContain("Db");
        expect(symbols).toContain("Eb");
      });
    });

    describe("ローマ数字表記", () => {
      it("度数とコードクオリティに基づいた正しいローマ数字", () => {
        const chords = getCategoryChords("C", "neo-soul");

        const I = chords.find((c) => c.chord.symbol === "C" && c.source === "diatonic");
        expect(I?.romanNumeral).toBe("I");

        const ii = chords.find((c) => c.chord.symbol === "Dm" && c.source === "diatonic");
        expect(ii?.romanNumeral).toBe("ii");

        const bIII = chords.find((c) => c.chord.symbol === "Eb");
        expect(bIII?.romanNumeral).toBe("bIII");

        const iv = chords.find((c) => c.chord.symbol === "Fm");
        expect(iv?.romanNumeral).toBe("iv");

        const bVI = chords.find((c) => c.chord.symbol === "Ab");
        expect(bVI?.romanNumeral).toBe("bVI");

        const bVII = chords.find((c) => c.chord.symbol === "Bb");
        expect(bVII?.romanNumeral).toBe("bVII");
      });

      it("セカンダリードミナントのローマ数字", () => {
        const chords = getCategoryChords("C", "neo-soul");
        const II = chords.find((c) => c.chord.symbol === "D" && c.source === "secondary-dominant");
        expect(II?.romanNumeral).toBe("II");
      });
    });

    describe("存在しないカテゴリ", () => {
      it("空の配列を返す", () => {
        const chords = getCategoryChords("C", "nonexistent" as never);
        expect(chords).toEqual([]);
      });
    });
  });
});
