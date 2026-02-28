import type { GridChord } from "../stores/chord-grid-store";
import { transposeGridChord } from "./transpose-grid-chord";

describe("transposeGridChord", () => {
  describe("diatonic コード", () => {
    it("C の I (C) を G に移調すると G になる", () => {
      const chord: GridChord = {
        rootName: "C",
        quality: "major",
        symbol: "C",
        source: "diatonic",
        chordFunction: "tonic",
        romanNumeral: "I",
        degree: 1,
      };

      const result = transposeGridChord(chord, "G");

      expect(result.rootName).toBe("G");
      expect(result.quality).toBe("major");
      expect(result.symbol).toBe("G");
      expect(result.degree).toBe(1);
      expect(result.romanNumeral).toBe("I");
      expect(result.chordFunction).toBe("tonic");
      expect(result.source).toBe("diatonic");
    });

    it("C の ii (Dm) を G に移調すると Am になる", () => {
      const chord: GridChord = {
        rootName: "D",
        quality: "minor",
        symbol: "Dm",
        source: "diatonic",
        chordFunction: "subdominant",
        romanNumeral: "ii",
        degree: 2,
      };

      const result = transposeGridChord(chord, "G");

      expect(result.rootName).toBe("A");
      expect(result.quality).toBe("minor");
      expect(result.symbol).toBe("Am");
    });

    it("C の V (G) を F に移調すると C になる", () => {
      const chord: GridChord = {
        rootName: "G",
        quality: "major",
        symbol: "G",
        source: "diatonic",
        chordFunction: "dominant",
        romanNumeral: "V",
        degree: 5,
      };

      const result = transposeGridChord(chord, "F");

      expect(result.rootName).toBe("C");
      expect(result.quality).toBe("major");
    });

    it("C の vii° (Bdim) を Db に移調すると Cdim になる", () => {
      const chord: GridChord = {
        rootName: "B",
        quality: "diminished",
        symbol: "Bdim",
        source: "diatonic",
        chordFunction: "dominant",
        romanNumeral: "vii°",
        degree: 7,
      };

      const result = transposeGridChord(chord, "Db");

      expect(result.rootName).toBe("C");
      expect(result.quality).toBe("diminished");
    });
  });

  describe("diatonic セブンスコード", () => {
    it("C の IM7 (CM7) を G に移調すると GM7 になる", () => {
      const chord: GridChord = {
        rootName: "C",
        quality: "major7",
        symbol: "CM7",
        source: "diatonic",
        chordFunction: "tonic",
        romanNumeral: "IM7",
        degree: 1,
      };

      const result = transposeGridChord(chord, "G");

      expect(result.rootName).toBe("G");
      expect(result.quality).toBe("major7");
      expect(result.symbol).toBe("GM7");
    });

    it("C の V7 (G7) を D に移調すると A7 になる", () => {
      const chord: GridChord = {
        rootName: "G",
        quality: "dominant7",
        symbol: "G7",
        source: "diatonic",
        chordFunction: "dominant",
        romanNumeral: "V7",
        degree: 5,
      };

      const result = transposeGridChord(chord, "D");

      expect(result.rootName).toBe("A");
      expect(result.quality).toBe("dominant7");
    });
  });

  describe("secondary-dominant コード", () => {
    it("C の V/ii (A) を G に移調すると E になる", () => {
      const chord: GridChord = {
        rootName: "A",
        quality: "major",
        symbol: "A",
        source: "secondary-dominant",
        chordFunction: "dominant",
        romanNumeral: "V/ii",
        degree: 2,
      };

      const result = transposeGridChord(chord, "G");

      expect(result.rootName).toBe("E");
      expect(result.quality).toBe("major");
      expect(result.source).toBe("secondary-dominant");
    });

    it("C の V7/V (D7) を F に移調すると G7 になる", () => {
      const chord: GridChord = {
        rootName: "D",
        quality: "dominant7",
        symbol: "D7",
        source: "secondary-dominant",
        chordFunction: "dominant",
        romanNumeral: "V7/V",
        degree: 5,
      };

      const result = transposeGridChord(chord, "F");

      expect(result.rootName).toBe("G");
      expect(result.quality).toBe("dominant7");
    });
  });

  describe("tritone-substitution コード", () => {
    it("C の SubV/ii (Eb) を G に移調すると Bb になる", () => {
      const chord: GridChord = {
        rootName: "Eb",
        quality: "major",
        symbol: "Eb",
        source: "tritone-substitution",
        chordFunction: "dominant",
        romanNumeral: "SubV/ii",
        degree: 2,
      };

      const result = transposeGridChord(chord, "G");

      expect(result.rootName).toBe("Bb");
      expect(result.quality).toBe("major");
      expect(result.source).toBe("tritone-substitution");
    });
  });

  describe("modal interchange コード", () => {
    it("C の natural-minor degree 3 (Eb) を G に移調すると Bb になる", () => {
      const chord: GridChord = {
        rootName: "Eb",
        quality: "major",
        symbol: "Eb",
        source: "natural-minor",
        chordFunction: "tonic",
        romanNumeral: "III",
        degree: 3,
      };

      const result = transposeGridChord(chord, "G");

      expect(result.rootName).toBe("Bb");
      expect(result.quality).toBe("major");
      expect(result.source).toBe("natural-minor");
    });

    it("C の lydian degree 2 (D) を A に移調すると B になる", () => {
      const chord: GridChord = {
        rootName: "D",
        quality: "major",
        symbol: "D",
        source: "lydian",
        chordFunction: "subdominant",
        romanNumeral: "II",
        degree: 2,
      };

      const result = transposeGridChord(chord, "A");

      expect(result.rootName).toBe("B");
      expect(result.quality).toBe("major");
      expect(result.source).toBe("lydian");
    });
  });

  describe("同じキーへの移調", () => {
    it("同じキーに移調してもコードは変わらない", () => {
      const chord: GridChord = {
        rootName: "C",
        quality: "major",
        symbol: "C",
        source: "diatonic",
        chordFunction: "tonic",
        romanNumeral: "I",
        degree: 1,
      };

      const result = transposeGridChord(chord, "C");

      expect(result.rootName).toBe("C");
      expect(result.quality).toBe("major");
      expect(result.symbol).toBe("C");
    });
  });
});
