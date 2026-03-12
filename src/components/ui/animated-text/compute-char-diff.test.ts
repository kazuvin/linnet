import { describe, expect, it } from "vitest";
import { computeCharDiff } from "./compute-char-diff";

describe("computeCharDiff", () => {
  it("同じ文字列の場合はすべて stay になる", () => {
    const result = computeCharDiff("Cm7", "Cm7");
    expect(result.items).toEqual([
      { char: "C", type: "stay", oldIndex: 0 },
      { char: "m", type: "stay", oldIndex: 1 },
      { char: "7", type: "stay", oldIndex: 2 },
    ]);
    expect(result.exits).toEqual([]);
  });

  it("Cm7 → C7: m がフェードアウトし、7 が左に移動する", () => {
    const result = computeCharDiff("Cm7", "C7");
    expect(result.items).toEqual([
      { char: "C", type: "stay", oldIndex: 0 },
      { char: "7", type: "stay", oldIndex: 2 },
    ]);
    expect(result.exits).toEqual([{ char: "m", oldIndex: 1 }]);
  });

  it("Am → Am7: 7 がフェードインする", () => {
    const result = computeCharDiff("Am", "Am7");
    expect(result.items).toEqual([
      { char: "A", type: "stay", oldIndex: 0 },
      { char: "m", type: "stay", oldIndex: 1 },
      { char: "7", type: "enter" },
    ]);
    expect(result.exits).toEqual([]);
  });

  it("C#m7 → Cm7: # がフェードアウトし、m と 7 が左に移動する", () => {
    const result = computeCharDiff("C#m7", "Cm7");
    expect(result.items).toEqual([
      { char: "C", type: "stay", oldIndex: 0 },
      { char: "m", type: "stay", oldIndex: 2 },
      { char: "7", type: "stay", oldIndex: 3 },
    ]);
    expect(result.exits).toEqual([{ char: "#", oldIndex: 1 }]);
  });

  it("空文字列 → テキスト: すべてがフェードインする", () => {
    const result = computeCharDiff("", "Am");
    expect(result.items).toEqual([
      { char: "A", type: "enter" },
      { char: "m", type: "enter" },
    ]);
    expect(result.exits).toEqual([]);
  });

  it("テキスト → 空文字列: すべてがフェードアウトする", () => {
    const result = computeCharDiff("Am", "");
    expect(result.items).toEqual([]);
    expect(result.exits).toEqual([
      { char: "A", oldIndex: 0 },
      { char: "m", oldIndex: 1 },
    ]);
  });

  it("完全に異なる文字列: すべて enter/exit になる", () => {
    const result = computeCharDiff("Am", "G7");
    expect(result.items).toEqual([
      { char: "G", type: "enter" },
      { char: "7", type: "enter" },
    ]);
    expect(result.exits).toEqual([
      { char: "A", oldIndex: 0 },
      { char: "m", oldIndex: 1 },
    ]);
  });

  it("重複文字がある場合: 順序を保って正しくマッチする", () => {
    // "CC" → "C" の場合、最初の C がマッチし、2番目の C が exit
    const result = computeCharDiff("CC", "C");
    expect(result.items).toEqual([{ char: "C", type: "stay", oldIndex: 0 }]);
    expect(result.exits).toEqual([{ char: "C", oldIndex: 1 }]);
  });

  it("Dm7 → D#m7: # がフェードインし、m と 7 が右に移動する", () => {
    const result = computeCharDiff("Dm7", "D#m7");
    expect(result.items).toEqual([
      { char: "D", type: "stay", oldIndex: 0 },
      { char: "#", type: "enter" },
      { char: "m", type: "stay", oldIndex: 1 },
      { char: "7", type: "stay", oldIndex: 2 },
    ]);
    expect(result.exits).toEqual([]);
  });
});
