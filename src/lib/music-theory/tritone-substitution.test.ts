import { getTritoneSubstitutionChords } from "./tritone-substitution";

describe("tritone-substitution", () => {
  describe("getTritoneSubstitutionChords", () => {
    it("5つの裏コードを返す（セカンダリードミナントと同じ対象度数）", () => {
      const chords = getTritoneSubstitutionChords("C");
      expect(chords).toHaveLength(5);
    });

    it("対象度数は2,3,4,5,6", () => {
      const chords = getTritoneSubstitutionChords("C");
      const targetDegrees = chords.map((c) => c.targetDegree);
      expect(targetDegrees).toEqual([2, 3, 4, 5, 6]);
    });

    describe("トライアド（Cメジャー）", () => {
      it("各裏コードのルートがセカンダリードミナントのトライトーン上にある", () => {
        const chords = getTritoneSubstitutionChords("C");
        const symbols = chords.map((c) => c.chord.symbol);
        // V/ii=A → SubV/ii=Eb, V/iii=B → SubV/iii=F,
        // V/IV=C → SubV/IV=Gb, V/V=D → SubV/V=Ab, V/vi=E → SubV/vi=Bb
        expect(symbols).toEqual(["Eb", "F", "Gb", "Ab", "Bb"]);
      });

      it("全てmajorクオリティ", () => {
        const chords = getTritoneSubstitutionChords("C");
        for (const c of chords) {
          expect(c.chord.quality).toBe("major");
        }
      });

      it("ローマ数字が SubV/xx 形式", () => {
        const chords = getTritoneSubstitutionChords("C");
        const numerals = chords.map((c) => c.romanNumeral);
        expect(numerals).toEqual(["SubV/ii", "SubV/iii", "SubV/IV", "SubV/V", "SubV/vi"]);
      });
    });

    describe("セブンス（Cメジャー）", () => {
      it("各裏コード7thのシンボルが正しい", () => {
        const chords = getTritoneSubstitutionChords("C", true);
        const symbols = chords.map((c) => c.chord.symbol);
        // SubV7/ii=Eb7, SubV7/iii=F7, SubV7/IV=Gb7, SubV7/V=Ab7, SubV7/vi=Bb7
        expect(symbols).toEqual(["Eb7", "F7", "Gb7", "Ab7", "Bb7"]);
      });

      it("全てdominant7クオリティ", () => {
        const chords = getTritoneSubstitutionChords("C", true);
        for (const c of chords) {
          expect(c.chord.quality).toBe("dominant7");
        }
      });

      it("ローマ数字が SubV7/xx 形式", () => {
        const chords = getTritoneSubstitutionChords("C", true);
        const numerals = chords.map((c) => c.romanNumeral);
        expect(numerals).toEqual(["SubV7/ii", "SubV7/iii", "SubV7/IV", "SubV7/V", "SubV7/vi"]);
      });
    });

    describe("フラット系キー", () => {
      it("Fメジャーの裏コードトライアド", () => {
        const chords = getTritoneSubstitutionChords("F");
        const symbols = chords.map((c) => c.chord.symbol);
        // F major: F G A Bb C D E
        // V/ii=D → SubV/ii=Ab, V/iii=E → SubV/iii=Bb,
        // V/IV=F → SubV/IV=Cb→B?, V/V=G → SubV/V=Db, V/vi=A → SubV/vi=Eb
        // F is a flat key (preferFlat=true), so Cb should be used... but Cb is not standard
        // Actually transposeNote with preferFlat=true: D+6=Ab, E+6=Bb, F+6=B(Cb?), G+6=Db, A+6=Eb
        // pitchClassToNoteName(11, true) = "B" in FLAT_NOTE_NAMES
        expect(symbols).toEqual(["Ab", "Bb", "B", "Db", "Eb"]);
      });

      it("Bbメジャーの裏コードトライアド", () => {
        const chords = getTritoneSubstitutionChords("Bb");
        const symbols = chords.map((c) => c.chord.symbol);
        // Bb major: Bb C D Eb F G A
        // V/ii=G → SubV/ii=Db, V/iii=A → SubV/iii=Eb,
        // V/IV=Bb → SubV/IV=E, V/V=C → SubV/V=Gb, V/vi=D → SubV/vi=Ab
        expect(symbols).toEqual(["Db", "Eb", "E", "Gb", "Ab"]);
      });
    });

    describe("シャープ系キー", () => {
      it("Gメジャーの裏コードセブンス", () => {
        const chords = getTritoneSubstitutionChords("G", true);
        const symbols = chords.map((c) => c.chord.symbol);
        // G major: G A B C D E F#
        // V7/ii=E7 → SubV7/ii=Bb7, V7/iii=F#7 → SubV7/iii=C7,
        // V7/IV=G7 → SubV7/IV=Db7, V7/V=A7 → SubV7/V=Eb7, V7/vi=B7 → SubV7/vi=F7
        // G is NOT a flat key, but the tritone sub chords are typically flat
        // transposeNote with preferFlat from shouldPreferFlat("G") = false
        // E+6=A#(Bb), F#+6=C, G+6=C#(Db), A+6=D#(Eb), B+6=F
        // Hmm, with preferFlat=false: E+6=A#, not Bb. That's a problem.
        // But secondary dominant already uses shouldPreferFlat for the root key.
        // For G (sharp key), preferFlat=false, so we'd get A#, not Bb.
        // However, tritone subs typically use flat notation...
        // Let me reconsider: the tritone sub should always prefer flats for the substituted root
        // because they are bII resolving down by half step.
        expect(symbols).toEqual(["Bb7", "C7", "Db7", "Eb7", "F7"]);
      });
    });

    it("解決先のローマ数字はダイアトニックの表記に従う", () => {
      const chords = getTritoneSubstitutionChords("C");
      const targetNumerals = chords.map((c) => c.targetRomanNumeral);
      expect(targetNumerals).toEqual(["ii", "iii", "IV", "V", "vi"]);
    });
  });
});
