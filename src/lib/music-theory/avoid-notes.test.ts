import { getAvoidPitchClasses } from "./avoid-notes";
import type { PitchClass } from "./note";

describe("avoid-notes", () => {
  describe("getAvoidPitchClasses", () => {
    // ======================================================================
    // チャーチモードにおけるアヴォイドノート
    // アヴォイドノート = コードトーンの半音上にあるスケールトーン（コードトーン自体は除外）
    // ======================================================================

    it("Cイオニアン（Cmaj7）のアヴォイドノートはF（Eの半音上）", () => {
      // Cmaj7: C(0), E(4), G(7), B(11)
      // C Ionian: C(0), D(2), E(4), F(5), G(7), A(9), B(11)
      // F(5) は E(4) の半音上 → アヴォイド
      const result = getAvoidPitchClasses("C", "major", "C", "major7");
      expect(result).toEqual(new Set<PitchClass>([5]));
    });

    it("Dドリアン（Dm7）のアヴォイドノートはC（Bの半音上）", () => {
      // Dm7: D(2), F(5), A(9), C(0)
      // D Dorian: D(2), E(4), F(5), G(7), A(9), B(11), C(0)
      // ★ F(5) は E(4) の半音上だが、E はコードトーンではない → アヴォイドではない
      // ★ C(0) は B(11) の半音上だが、C はコードトーン → アヴォイドではない
      // → 伝統的理論: ドリアンにはアヴォイドノートなし
      const result = getAvoidPitchClasses("D", "dorian", "D", "minor7");
      expect(result).toEqual(new Set<PitchClass>());
    });

    it("Eフリジアン（Em7）のアヴォイドノートはF（Eの半音上）とC（Bの半音上）", () => {
      // Em7: E(4), G(7), B(11), D(2)
      // E Phrygian: E(4), F(5), G(7), A(9), B(11), C(0), D(2)
      // F(5) は E(4) の半音上 → アヴォイド
      // C(0) は B(11) の半音上 → アヴォイド
      const result = getAvoidPitchClasses("E", "phrygian", "E", "minor7");
      expect(result).toEqual(new Set<PitchClass>([5, 0]));
    });

    it("Fリディアン（Fmaj7）にはアヴォイドノートがない", () => {
      // Fmaj7: F(5), A(9), C(0), E(4)
      // F Lydian: F(5), G(7), A(9), B(11), C(0), D(2), E(4)
      // G(7) は F(5)の半音上ではない（全音上）
      // → リディアンにはアヴォイドノートなし
      const result = getAvoidPitchClasses("F", "lydian", "F", "major7");
      expect(result).toEqual(new Set<PitchClass>());
    });

    it("Gミクソリディアン（G7）のアヴォイドノートはC（Bの半音上）", () => {
      // G7: G(7), B(11), D(2), F(5)
      // G Mixolydian: G(7), A(9), B(11), C(0), D(2), E(4), F(5)
      // C(0) は B(11) の半音上、C はスケールトーン → アヴォイド
      const result = getAvoidPitchClasses("G", "mixolydian", "G", "dominant7");
      expect(result).toEqual(new Set<PitchClass>([0]));
    });

    it("Aエオリアン（Am7）のアヴォイドノートはF（Eの半音上）", () => {
      // Am7: A(9), C(0), E(4), G(7)
      // A Aeolian: A(9), B(11), C(0), D(2), E(4), F(5), G(7)
      // F(5) は E(4) の半音上 → アヴォイド
      // B(11) は A(9) の半音上ではない（全音上）
      const result = getAvoidPitchClasses("A", "aeolian", "A", "minor7");
      expect(result).toEqual(new Set<PitchClass>([5]));
    });

    it("Bロクリアン（Bm7b5）のアヴォイドノートはC（Bの半音上）", () => {
      // Bm7b5: B(11), D(2), F(5), A(9)
      // B Locrian: B(11), C(0), D(2), E(4), F(5), G(7), A(9)
      // C(0) は B(11) の半音上 → アヴォイド
      const result = getAvoidPitchClasses("B", "locrian", "B", "minor7b5");
      expect(result).toEqual(new Set<PitchClass>([0]));
    });

    // ======================================================================
    // トライアドに対するアヴォイドノート
    // ======================================================================

    it("Cメジャー（Cトライアド）のアヴォイドノートはF（Eの半音上）", () => {
      // C major: C(0), E(4), G(7)
      // C Ionian: C(0), D(2), E(4), F(5), G(7), A(9), B(11)
      // F(5) は E(4) の半音上 → アヴォイド
      const result = getAvoidPitchClasses("C", "major", "C", "major");
      expect(result).toEqual(new Set<PitchClass>([5]));
    });

    // ======================================================================
    // リディアンドミナント等の特殊スケール
    // ======================================================================

    it("Cリディアンドミナント（C7）にはアヴォイドノートがない", () => {
      // C7: C(0), E(4), G(7), Bb(10)
      // C Lydian Dominant: C(0), D(2), E(4), F#(6), G(7), A(9), Bb(10)
      // F#(6) は E(4)の半音上ではない（全音上）
      // Bb(10) は A(9)の半音上だが、Bb はコードトーン → アヴォイドではない
      const result = getAvoidPitchClasses("C", "lydian-dominant", "C", "dominant7");
      expect(result).toEqual(new Set<PitchClass>());
    });

    // ======================================================================
    // 返り値はSetである
    // ======================================================================

    it("返り値はSetである", () => {
      const result = getAvoidPitchClasses("C", "major", "C", "major");
      expect(result).toBeInstanceOf(Set);
    });

    // ======================================================================
    // 複数のアヴォイドノートがある場合
    // ======================================================================

    it("Eフリジアンドミナント（E7）のアヴォイドノートはF（Eの半音上）", () => {
      // E7: E(4), G#(8), B(11), D(2)
      // E Phrygian Dominant: E(4), F(5), G#(8), A(9), B(11), C(0), D(2)
      // F(5) は E(4) の半音上 → アヴォイド
      // A(9) は G#(8) の半音上 → アヴォイド
      // C(0) は B(11) の半音上 → アヴォイド
      const result = getAvoidPitchClasses("E", "phrygian-dominant", "E", "dominant7");
      expect(result).toEqual(new Set<PitchClass>([5, 9, 0]));
    });

    // ======================================================================
    // コードトーン自体はアヴォイドに含まれない
    // ======================================================================

    it("コードトーンの半音上がコードトーン自身の場合はアヴォイドに含まれない", () => {
      // dim7コード: B(11), D(2), F(5), Ab(8) — 3半音間隔
      // Locrian: B(11), C(0), D(2), E(4), F(5), G(7), A(9)
      // C(0) は B(11) の半音上 → Cはコードトーンではない → アヴォイド
      // E(4) は D(2) の半音上ではない（全音上）
      // G(7) は F(5) の半音上ではない（全音上）
      const result = getAvoidPitchClasses("B", "locrian", "B", "diminished7");
      // C(0) は B(11) の半音上 → アヴォイド
      expect(result.has(0)).toBe(true);
    });
  });
});
