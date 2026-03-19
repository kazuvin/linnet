import { describe, expect, it } from "vitest";
import { findAllChordsInScale } from "./scale-chords";

/** 指定ディグリーのコードシンボル一覧を取得するヘルパー */
function getSymbolsForDegree(
  rootName: string,
  scaleType: Parameters<typeof findAllChordsInScale>[1],
  degree: number
): string[] {
  const result = findAllChordsInScale(rootName, scaleType);
  const group = result.find((g) => g.degree === degree);
  return group?.chords.map((c) => c.chord.symbol) ?? [];
}

describe("findAllChordsInScale", () => {
  it("Cメジャースケールの1度にはC, CM7を含む", () => {
    const symbols = getSymbolsForDegree("C", "major", 1);
    expect(symbols).toContain("C");
    expect(symbols).toContain("CM7");
  });

  it("Cメジャースケールの1度にはCm（短3度=Eb）を含まない", () => {
    const symbols = getSymbolsForDegree("C", "major", 1);
    expect(symbols).not.toContain("Cm");
  });

  it("Cメジャースケールの2度にはDm, Dm7を含む", () => {
    const symbols = getSymbolsForDegree("C", "major", 2);
    expect(symbols).toContain("Dm");
    expect(symbols).toContain("Dm7");
  });

  it("Cメジャースケールの5度にはG, G7, Gsus4を含む", () => {
    const symbols = getSymbolsForDegree("C", "major", 5);
    expect(symbols).toContain("G");
    expect(symbols).toContain("G7");
    expect(symbols).toContain("Gsus4");
  });

  it("Cメジャースケールの7度にはBdim, Bm7(b5)を含む", () => {
    const symbols = getSymbolsForDegree("C", "major", 7);
    expect(symbols).toContain("Bdim");
    expect(symbols).toContain("Bm7(b5)");
  });

  it("7音スケールでは7つのディグリーグループを返す", () => {
    const result = findAllChordsInScale("C", "major");
    expect(result).toHaveLength(7);
    expect(result.map((g) => g.degree)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("各ディグリーに少なくとも1つのコードがある", () => {
    const result = findAllChordsInScale("C", "major");
    for (const group of result) {
      expect(group.chords.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("Cナチュラルマイナーの1度にはCm, Cm7を含む", () => {
    const symbols = getSymbolsForDegree("C", "natural-minor", 1);
    expect(symbols).toContain("Cm");
    expect(symbols).toContain("Cm7");
  });

  it("各コードにromanNumeralが設定されている", () => {
    const result = findAllChordsInScale("C", "major");
    for (const group of result) {
      for (const chord of group.chords) {
        expect(chord.romanNumeral).toBeDefined();
        expect(chord.romanNumeral.length).toBeGreaterThan(0);
      }
    }
  });

  it("各コードにchordFunctionが設定されている", () => {
    const result = findAllChordsInScale("C", "major");
    for (const group of result) {
      for (const chord of group.chords) {
        expect(["tonic", "subdominant", "dominant"]).toContain(chord.chordFunction);
      }
    }
  });

  it("Cメジャースケールの1度にadd9コードを含む（C, E, G, Dが全てスケール内）", () => {
    const symbols = getSymbolsForDegree("C", "major", 1);
    expect(symbols).toContain("Cadd9");
  });

  it("Cメジャースケールの1度に6thコードを含む（C, E, G, Aが全てスケール内）", () => {
    const symbols = getSymbolsForDegree("C", "major", 1);
    expect(symbols).toContain("C6");
  });
});
