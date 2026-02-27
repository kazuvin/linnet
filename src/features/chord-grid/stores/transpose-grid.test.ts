import type { GridChord } from "./chord-grid-store";
import { transposeGridChord, transposeGridRows } from "./transpose-grid";

describe("transposeGridChord", () => {
  it("ダイアトニックコードをトランスポーズする（C→G: I=C→G）", () => {
    const chord: GridChord = {
      rootName: "C",
      quality: "major",
      symbol: "C",
      source: "diatonic",
      chordFunction: "tonic",
      romanNumeral: "I",
      degree: 1,
    };

    const result = transposeGridChord(chord, "C", "G");
    expect(result.rootName).toBe("G");
    expect(result.symbol).toBe("G");
    expect(result.quality).toBe("major");
    expect(result.romanNumeral).toBe("I");
    expect(result.degree).toBe(1);
    expect(result.source).toBe("diatonic");
    expect(result.chordFunction).toBe("tonic");
  });

  it("マイナーコードもトランスポーズされる（C→G: ii=Dm→Am）", () => {
    const chord: GridChord = {
      rootName: "D",
      quality: "minor",
      symbol: "Dm",
      source: "diatonic",
      chordFunction: "subdominant",
      romanNumeral: "ii",
      degree: 2,
    };

    const result = transposeGridChord(chord, "C", "G");
    expect(result.rootName).toBe("A");
    expect(result.symbol).toBe("Am");
  });

  it("セブンスコードをトランスポーズする（C→F: IM7=CM7→FM7）", () => {
    const chord: GridChord = {
      rootName: "C",
      quality: "major7",
      symbol: "CM7",
      source: "diatonic",
      chordFunction: "tonic",
      romanNumeral: "IM7",
      degree: 1,
    };

    const result = transposeGridChord(chord, "C", "F");
    expect(result.rootName).toBe("F");
    expect(result.symbol).toBe("FM7");
    expect(result.quality).toBe("major7");
  });

  it("フラットキーではフラット表記になる（C→F: V=G→C）", () => {
    const chord: GridChord = {
      rootName: "G",
      quality: "major",
      symbol: "G",
      source: "diatonic",
      chordFunction: "dominant",
      romanNumeral: "V",
      degree: 5,
    };

    const result = transposeGridChord(chord, "C", "F");
    expect(result.rootName).toBe("C");
    expect(result.symbol).toBe("C");
  });

  it("フラットキーへのトランスポーズでフラット表記を使う（C→Eb: I=C→Eb）", () => {
    const chord: GridChord = {
      rootName: "C",
      quality: "major",
      symbol: "C",
      source: "diatonic",
      chordFunction: "tonic",
      romanNumeral: "I",
      degree: 1,
    };

    const result = transposeGridChord(chord, "C", "Eb");
    expect(result.rootName).toBe("Eb");
    expect(result.symbol).toBe("Eb");
  });

  it("セカンダリードミナントをトランスポーズする（C→G: V/ii=A→E）", () => {
    const chord: GridChord = {
      rootName: "A",
      quality: "dominant7",
      symbol: "A7",
      source: "secondary-dominant",
      chordFunction: "dominant",
      romanNumeral: "V7/ii",
      degree: 2,
    };

    const result = transposeGridChord(chord, "C", "G");
    expect(result.rootName).toBe("E");
    expect(result.symbol).toBe("E7");
    expect(result.source).toBe("secondary-dominant");
    expect(result.romanNumeral).toBe("V7/ii");
  });

  it("裏コードをトランスポーズする（C→G: SubV/ii=Eb→Bb）", () => {
    const chord: GridChord = {
      rootName: "Eb",
      quality: "dominant7",
      symbol: "Eb7",
      source: "tritone-substitution",
      chordFunction: "dominant",
      romanNumeral: "SubV7/ii",
      degree: 2,
    };

    const result = transposeGridChord(chord, "C", "G");
    expect(result.rootName).toBe("Bb");
    expect(result.symbol).toBe("Bb7");
    expect(result.source).toBe("tritone-substitution");
  });

  it("裏コードは常にフラット表記を使う", () => {
    const chord: GridChord = {
      rootName: "Db",
      quality: "dominant7",
      symbol: "Db7",
      source: "tritone-substitution",
      chordFunction: "dominant",
      romanNumeral: "SubV7/V",
      degree: 5,
    };

    // C→D: Db + 2 = Eb (フラット表記を維持)
    const result = transposeGridChord(chord, "C", "D");
    expect(result.rootName).toBe("Eb");
    expect(result.symbol).toBe("Eb7");
  });

  it("モーダルインターチェンジコードをトランスポーズする（C→G）", () => {
    const chord: GridChord = {
      rootName: "Bb",
      quality: "major",
      symbol: "Bb",
      source: "natural-minor",
      chordFunction: "dominant",
      romanNumeral: "VII",
      degree: 7,
    };

    const result = transposeGridChord(chord, "C", "G");
    expect(result.rootName).toBe("F");
    expect(result.symbol).toBe("F");
    expect(result.source).toBe("natural-minor");
  });

  it("同じキーへのトランスポーズでは変化しない", () => {
    const chord: GridChord = {
      rootName: "C",
      quality: "major",
      symbol: "C",
      source: "diatonic",
      chordFunction: "tonic",
      romanNumeral: "I",
      degree: 1,
    };

    const result = transposeGridChord(chord, "C", "C");
    expect(result).toEqual(chord);
  });
});

describe("transposeGridRows", () => {
  it("全行のコードをトランスポーズする", () => {
    const chordC: GridChord = {
      rootName: "C",
      quality: "major",
      symbol: "C",
      source: "diatonic",
      chordFunction: "tonic",
      romanNumeral: "I",
      degree: 1,
    };
    const chordG: GridChord = {
      rootName: "G",
      quality: "major",
      symbol: "G",
      source: "diatonic",
      chordFunction: "dominant",
      romanNumeral: "V",
      degree: 5,
    };

    const rows: (GridChord | null)[][] = [
      [
        chordC,
        null,
        null,
        null,
        chordG,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
    ];

    const result = transposeGridRows(rows, "C", "G");
    expect(result[0][0]?.rootName).toBe("G");
    expect(result[0][0]?.symbol).toBe("G");
    expect(result[0][4]?.rootName).toBe("D");
    expect(result[0][4]?.symbol).toBe("D");
  });

  it("null セルはそのまま維持される", () => {
    const rows: (GridChord | null)[][] = [
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
    ];

    const result = transposeGridRows(rows, "C", "G");
    expect(result[0].every((c) => c === null)).toBe(true);
  });

  it("元の rows を変更しない（イミュータブル）", () => {
    const chord: GridChord = {
      rootName: "C",
      quality: "major",
      symbol: "C",
      source: "diatonic",
      chordFunction: "tonic",
      romanNumeral: "I",
      degree: 1,
    };

    const rows: (GridChord | null)[][] = [
      [
        chord,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
    ];

    const result = transposeGridRows(rows, "C", "G");
    expect(rows[0][0]?.rootName).toBe("C");
    expect(result[0][0]?.rootName).toBe("G");
  });
});
