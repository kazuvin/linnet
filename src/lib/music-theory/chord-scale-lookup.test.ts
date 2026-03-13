import { describe, expect, it } from "vitest";
import type { ChordQuality } from "./chord";
import { findScalesForChord } from "./chord-scale-lookup";

describe("findScalesForChord", () => {
  it("Cmajor に対して Ionian / Lydian を含む結果を返す", () => {
    const results = findScalesForChord("C", "major");
    const scaleTypes = results.map((r) => r.scaleType);
    expect(scaleTypes).toContain("major"); // Ionian
    expect(scaleTypes).toContain("lydian");
  });

  it("Cminor に対して Dorian / Aeolian / Phrygian を含む結果を返す", () => {
    const results = findScalesForChord("C", "minor");
    const scaleTypes = results.map((r) => r.scaleType);
    expect(scaleTypes).toContain("dorian");
    expect(scaleTypes).toContain("aeolian");
    expect(scaleTypes).toContain("phrygian");
  });

  it("C dominant7 に対して Mixolydian / Lydian Dominant を含む結果を返す", () => {
    const results = findScalesForChord("C", "dominant7");
    const scaleTypes = results.map((r) => r.scaleType);
    expect(scaleTypes).toContain("mixolydian");
    expect(scaleTypes).toContain("lydian-dominant");
    // Altered は P5 を含まないため dominant7 にはマッチしない
    expect(scaleTypes).not.toContain("altered");
  });

  it("C minor7b5 に対して Locrian を含む結果を返す", () => {
    const results = findScalesForChord("C", "minor7b5");
    const scaleTypes = results.map((r) => r.scaleType);
    expect(scaleTypes).toContain("locrian");
  });

  it("C diminished に対して結果を返す", () => {
    const results = findScalesForChord("C", "diminished");
    expect(results.length).toBeGreaterThan(0);
    const scaleTypes = results.map((r) => r.scaleType);
    expect(scaleTypes).toContain("locrian");
  });

  it("結果に displayName が含まれる", () => {
    const results = findScalesForChord("C", "major");
    for (const result of results) {
      expect(result.displayName).toBeDefined();
      expect(result.displayName.length).toBeGreaterThan(0);
    }
  });

  it("重複するスケールタイプを含まない", () => {
    const results = findScalesForChord("C", "minor");
    const scaleTypes = results.map((r) => r.scaleType);
    const unique = new Set(scaleTypes);
    expect(unique.size).toBe(scaleTypes.length);
  });

  it("異なるルートでも正しく動作する (F# minor7)", () => {
    const results = findScalesForChord("F#", "minor7");
    const scaleTypes = results.map((r) => r.scaleType);
    expect(scaleTypes).toContain("dorian");
    expect(scaleTypes).toContain("aeolian");
  });

  it("augmented コードに対して結果を返す", () => {
    const results = findScalesForChord("C", "augmented");
    expect(results.length).toBeGreaterThan(0);
  });

  it("全 ChordQuality に対して空でない結果を返す", () => {
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
      "sus2",
      "sus4",
      "6",
      "minor6",
      "minorMajor7",
      "7sus4",
      "add9",
      "dominant9",
      "major9",
      "minor9",
      "dominant7sharp9",
      "dominant7flat9",
    ];
    for (const quality of qualities) {
      const results = findScalesForChord("C", quality);
      expect(results.length, `${quality} should have results`).toBeGreaterThan(0);
    }
  });

  // テンションコード向けスケール検索テスト
  it("C minorMajor7 に対して Harmonic Minor を含む結果を返す", () => {
    const results = findScalesForChord("C", "minorMajor7");
    const scaleTypes = results.map((r) => r.scaleType);
    expect(scaleTypes).toContain("harmonic-minor");
    expect(scaleTypes).toContain("melodic-minor");
  });

  it("C sus4 に対して結果を返す", () => {
    const results = findScalesForChord("C", "sus4");
    expect(results.length).toBeGreaterThan(0);
  });

  it("C dominant9 に対して Mixolydian を含む結果を返す", () => {
    const results = findScalesForChord("C", "dominant9");
    const scaleTypes = results.map((r) => r.scaleType);
    expect(scaleTypes).toContain("mixolydian");
  });
});
