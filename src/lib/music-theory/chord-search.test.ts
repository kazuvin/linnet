import { describe, expect, it } from "vitest";
import { classifyChordSearchResults, findChordsContainingNotes } from "./chord-search";
import type { PitchClass } from "./note";

describe("findChordsContainingNotes", () => {
  it("空の配列を渡すと空の結果を返す", () => {
    const results = findChordsContainingNotes([]);
    expect(results).toEqual([]);
  });

  it("単一のピッチクラス（C=0）を含む全コードを返す", () => {
    const results = findChordsContainingNotes([0 as PitchClass]);
    expect(results.length).toBeGreaterThan(0);
    // 全結果がピッチクラス0を含むことを確認
    for (const result of results) {
      const pitchClasses = result.pitchClasses;
      expect(pitchClasses).toContain(0);
    }
  });

  it("C, E（ピッチクラス0, 4）を含むコードにCメジャーが含まれる", () => {
    const results = findChordsContainingNotes([0 as PitchClass, 4 as PitchClass]);
    const symbols = results.map((r) => r.symbol);
    expect(symbols).toContain("C"); // C major
  });

  it("C, E, G（ピッチクラス0, 4, 7）を含むコードにCメジャーが含まれる", () => {
    const results = findChordsContainingNotes([0 as PitchClass, 4 as PitchClass, 7 as PitchClass]);
    const symbols = results.map((r) => r.symbol);
    expect(symbols).toContain("C"); // C major
    expect(symbols).toContain("CM7"); // C major7
  });

  it("C, Eb, G（ピッチクラス0, 3, 7）を含むコードにCmが含まれる", () => {
    const results = findChordsContainingNotes([0 as PitchClass, 3 as PitchClass, 7 as PitchClass]);
    const symbols = results.map((r) => r.symbol);
    expect(symbols).toContain("Cm"); // C minor
    expect(symbols).toContain("Cm7"); // C minor7
  });

  it("結果にルート音名・クオリティ・シンボル・ピッチクラスが含まれる", () => {
    const results = findChordsContainingNotes([0 as PitchClass, 4 as PitchClass]);
    const cMajor = results.find((r) => r.rootName === "C" && r.quality === "major");
    expect(cMajor).toBeDefined();
    expect(cMajor?.symbol).toBe("C");
    expect(cMajor?.pitchClasses).toEqual([0, 4, 7]);
  });

  it("異名同音（エンハーモニック）を正しく扱う: C#とDbは同じピッチクラス", () => {
    const results = findChordsContainingNotes([1 as PitchClass, 5 as PitchClass]);
    // C#/Dbをルートとするコードが含まれる
    const hasSharp = results.some((r) => r.rootName === "C#");
    const hasFlat = results.some((r) => r.rootName === "Db");
    expect(hasSharp || hasFlat).toBe(true);
  });

  it("4音以上を指定すると結果が絞り込まれる", () => {
    const twoNotes = findChordsContainingNotes([0 as PitchClass, 4 as PitchClass]);
    const fourNotes = findChordsContainingNotes([
      0 as PitchClass,
      4 as PitchClass,
      7 as PitchClass,
      11 as PitchClass,
    ]);
    expect(fourNotes.length).toBeLessThan(twoNotes.length);
  });
});

describe("classifyChordSearchResults", () => {
  it("ベース音がルートと一致する場合、rootPositionに分類される", () => {
    // C, E, G を選択、ベース音 = C (pitchClass 0)
    const results = findChordsContainingNotes([0 as PitchClass, 4 as PitchClass, 7 as PitchClass]);
    const classified = classifyChordSearchResults(results, 0 as PitchClass);

    // Cメジャーはルートポジション
    const cMajor = classified.rootPosition.find((r) => r.rootName === "C" && r.quality === "major");
    expect(cMajor).toBeDefined();
    expect(cMajor?.bassNoteName).toBeUndefined();
  });

  it("ベース音がルートと一致しない場合、inversionsに分類されbassNoteNameが付く", () => {
    // C, E, G を選択、ベース音 = E (pitchClass 4)
    const results = findChordsContainingNotes([0 as PitchClass, 4 as PitchClass, 7 as PitchClass]);
    const classified = classifyChordSearchResults(results, 4 as PitchClass);

    // Cメジャーは転回形（C/E）
    const cMajorInversion = classified.inversions.find(
      (r) => r.rootName === "C" && r.quality === "major"
    );
    expect(cMajorInversion).toBeDefined();
    expect(cMajorInversion?.bassNoteName).toBe("E");
    expect(cMajorInversion?.symbol).toBe("C/E");
  });

  it("ベース音がundefinedの場合、全てrootPositionに分類される（従来互換）", () => {
    const results = findChordsContainingNotes([0 as PitchClass, 4 as PitchClass, 7 as PitchClass]);
    const classified = classifyChordSearchResults(results, undefined);

    expect(classified.inversions).toHaveLength(0);
    expect(classified.rootPosition.length).toBe(results.length);
  });

  it("Am/Cのようにフラット系の音名でもスラッシュ表記が正しい", () => {
    // A, C, E を選択、ベース音 = C (pitchClass 0)
    const results = findChordsContainingNotes([9 as PitchClass, 0 as PitchClass, 4 as PitchClass]);
    const classified = classifyChordSearchResults(results, 0 as PitchClass);

    const amInversion = classified.inversions.find(
      (r) => r.rootName === "A" && r.quality === "minor"
    );
    expect(amInversion).toBeDefined();
    expect(amInversion?.bassNoteName).toBe("C");
    expect(amInversion?.symbol).toBe("Am/C");
  });
});
