import { describe, expect, it } from "vitest";
import { computeCharDiff, type DisplayChar, mergeDisplayChars } from "./compute-char-diff";

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

describe("mergeDisplayChars", () => {
  let counter = 0;
  const genId = () => `new-${counter++}`;

  const makeChars = (text: string, prefix: string): DisplayChar[] =>
    text.split("").map((char, i) => ({ id: `${prefix}${i}`, char, state: "stable" as const }));

  it("Cm7 → C7: m が exiting になり、stay 文字間に配置される", () => {
    const old = makeChars("Cm7", "o");
    const diff = computeCharDiff("Cm7", "C7");
    const result = mergeDisplayChars(old, diff, genId);

    expect(result.map((c) => [c.char, c.state, c.id])).toEqual([
      ["C", "stable", "o0"],
      ["m", "exiting", "o1"],
      ["7", "stable", "o2"],
    ]);
  });

  it("Am → Am7: 7 が entering として末尾に追加される", () => {
    counter = 0;
    const old = makeChars("Am", "o");
    const diff = computeCharDiff("Am", "Am7");
    const result = mergeDisplayChars(old, diff, genId);

    expect(result.map((c) => [c.char, c.state])).toEqual([
      ["A", "stable"],
      ["m", "stable"],
      ["7", "entering"],
    ]);
    // 既存文字は ID が保持される
    expect(result[0].id).toBe("o0");
    expect(result[1].id).toBe("o1");
  });

  it("Dm7 → D#m7: # が entering として D と m の間に挿入される", () => {
    counter = 0;
    const old = makeChars("Dm7", "o");
    const diff = computeCharDiff("Dm7", "D#m7");
    const result = mergeDisplayChars(old, diff, genId);

    expect(result.map((c) => [c.char, c.state])).toEqual([
      ["D", "stable"],
      ["#", "entering"],
      ["m", "stable"],
      ["7", "stable"],
    ]);
  });

  it("C#m7 → Cm7: # が exiting として C と m の間に配置される", () => {
    const old = makeChars("C#m7", "o");
    const diff = computeCharDiff("C#m7", "Cm7");
    const result = mergeDisplayChars(old, diff, genId);

    expect(result.map((c) => [c.char, c.state])).toEqual([
      ["C", "stable"],
      ["#", "exiting"],
      ["m", "stable"],
      ["7", "stable"],
    ]);
    // 既存文字の ID が保持される
    expect(result[0].id).toBe("o0");
    expect(result[1].id).toBe("o1"); // # は元の ID を維持
    expect(result[2].id).toBe("o2");
    expect(result[3].id).toBe("o3");
  });

  it("完全に異なる文字列: すべて exiting/entering になる", () => {
    counter = 0;
    const old = makeChars("Am", "o");
    const diff = computeCharDiff("Am", "G7");
    const result = mergeDisplayChars(old, diff, genId);

    expect(result.map((c) => [c.char, c.state])).toEqual([
      ["A", "exiting"],
      ["m", "exiting"],
      ["G", "entering"],
      ["7", "entering"],
    ]);
  });

  it("既に exiting の文字はスキップされる", () => {
    counter = 0;
    const old: DisplayChar[] = [
      { id: "o0", char: "C", state: "stable" },
      { id: "o1", char: "m", state: "exiting" },
      { id: "o2", char: "7", state: "stable" },
    ];
    const diff = computeCharDiff("C7", "C");
    const result = mergeDisplayChars(old, diff, genId);

    expect(result.map((c) => [c.char, c.state])).toEqual([
      ["C", "stable"],
      ["7", "exiting"],
    ]);
  });
});
