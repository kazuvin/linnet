import { getSecondaryDominantChords } from "./secondary-dominant";

describe("secondary-dominant", () => {
  describe("getSecondaryDominantChords", () => {
    it("5つのセカンダリードミナントを返す（vii°は除外）", () => {
      const chords = getSecondaryDominantChords("C");
      expect(chords).toHaveLength(5);
    });

    it("対象度数は2,3,4,5,6", () => {
      const chords = getSecondaryDominantChords("C");
      const targetDegrees = chords.map((c) => c.targetDegree);
      expect(targetDegrees).toEqual([2, 3, 4, 5, 6]);
    });

    describe("トライアド（Cメジャー）", () => {
      it("各セカンダリードミナントのルートが正しい", () => {
        const chords = getSecondaryDominantChords("C");
        const symbols = chords.map((c) => c.chord.symbol);
        // V/ii=A, V/iii=B, V/IV=C, V/V=D, V/vi=E
        expect(symbols).toEqual(["A", "B", "C", "D", "E"]);
      });

      it("全てmajorクオリティ", () => {
        const chords = getSecondaryDominantChords("C");
        for (const c of chords) {
          expect(c.chord.quality).toBe("major");
        }
      });

      it("ローマ数字が V/xx 形式", () => {
        const chords = getSecondaryDominantChords("C");
        const numerals = chords.map((c) => c.romanNumeral);
        expect(numerals).toEqual(["V/ii", "V/iii", "V/IV", "V/V", "V/vi"]);
      });
    });

    describe("セブンス（Cメジャー）", () => {
      it("各セカンダリードミナント7thのシンボルが正しい", () => {
        const chords = getSecondaryDominantChords("C", true);
        const symbols = chords.map((c) => c.chord.symbol);
        // V7/ii=A7, V7/iii=B7, V7/IV=C7, V7/V=D7, V7/vi=E7
        expect(symbols).toEqual(["A7", "B7", "C7", "D7", "E7"]);
      });

      it("全てdominant7クオリティ", () => {
        const chords = getSecondaryDominantChords("C", true);
        for (const c of chords) {
          expect(c.chord.quality).toBe("dominant7");
        }
      });

      it("ローマ数字が V7/xx 形式", () => {
        const chords = getSecondaryDominantChords("C", true);
        const numerals = chords.map((c) => c.romanNumeral);
        expect(numerals).toEqual(["V7/ii", "V7/iii", "V7/IV", "V7/V", "V7/vi"]);
      });
    });

    describe("フラット系キー", () => {
      it("Fメジャーのセカンダリードミナントトライアド", () => {
        const chords = getSecondaryDominantChords("F");
        const symbols = chords.map((c) => c.chord.symbol);
        // V/ii=D, V/iii=E, V/IV=F, V/V=G, V/vi=A (but note Bb key prefers flats)
        // F major scale: F G A Bb C D E
        // ii=Gm → V/ii=D, iii=Am → V/iii=E, IV=Bb → V/IV=F, V=C → V/V=G, vi=Dm → V/vi=A
        expect(symbols).toEqual(["D", "E", "F", "G", "A"]);
      });

      it("Bbメジャーのセカンダリードミナントトライアド", () => {
        const chords = getSecondaryDominantChords("Bb");
        const symbols = chords.map((c) => c.chord.symbol);
        // Bb major scale: Bb C D Eb F G A
        // ii=Cm → V/ii=G, iii=Dm → V/iii=A, IV=Eb → V/IV=Bb, V=F → V/V=C, vi=Gm → V/vi=D
        expect(symbols).toEqual(["G", "A", "Bb", "C", "D"]);
      });
    });

    describe("シャープ系キー", () => {
      it("Gメジャーのセカンダリードミナントセブンス", () => {
        const chords = getSecondaryDominantChords("G", true);
        const symbols = chords.map((c) => c.chord.symbol);
        // G major scale: G A B C D E F#
        // ii=Am → V7/ii=E7, iii=Bm → V7/iii=F#7, IV=C → V7/IV=G7, V=D → V7/V=A7, vi=Em → V7/vi=B7
        expect(symbols).toEqual(["E7", "F#7", "G7", "A7", "B7"]);
      });
    });

    it("解決先のローマ数字はダイアトニックの表記に従う", () => {
      const chords = getSecondaryDominantChords("C");
      const targetNumerals = chords.map((c) => c.targetRomanNumeral);
      expect(targetNumerals).toEqual(["ii", "iii", "IV", "V", "vi"]);
    });
  });
});
