import { getNoteAtPosition } from "./fretboard";
import { type ChordVoicing, findChordPositions } from "./voicing";

/** ボイシングからフレット文字列を生成 (例: "x32010") */
function toFretString(voicing: ChordVoicing): string {
  return voicing.frets.map((f) => (f === null ? "x" : f >= 10 ? `(${f})` : String(f))).join("");
}

/** ボイシングのコードトーン（ピッチクラス）のSetを取得 */
function getPitchClasses(voicing: ChordVoicing): Set<number> {
  const pcs = new Set<number>();
  voicing.frets.forEach((fret, i) => {
    if (fret !== null) {
      const stringNum = 6 - i;
      pcs.add(getNoteAtPosition(stringNum, fret).pitchClass);
    }
  });
  return pcs;
}

describe("findChordPositions（ボイシング算出）", () => {
  describe("基本構造", () => {
    it("ChordVoicing の frets は常に6要素", () => {
      const voicings = findChordPositions("C", "major");
      for (const v of voicings) {
        expect(v.frets).toHaveLength(6);
      }
    });

    it("各ボイシングに chord プロパティがある", () => {
      const voicings = findChordPositions("C", "major");
      expect(voicings.length).toBeGreaterThan(0);
      for (const v of voicings) {
        expect(v.chord.root.name).toBe("C");
        expect(v.chord.quality).toBe("major");
      }
    });

    it("各ボイシングに rootString プロパティがある", () => {
      const voicings = findChordPositions("C", "major");
      for (const v of voicings) {
        expect([6, 5, 4]).toContain(v.rootString);
      }
    });

    it("空でない結果を返す", () => {
      const voicings = findChordPositions("C", "major");
      expect(voicings.length).toBeGreaterThan(0);
    });
  });

  describe("コードトーンの網羅性", () => {
    it("各ボイシングに全てのコードトーンが含まれる（C major: C, E, G）", () => {
      const voicings = findChordPositions("C", "major");
      for (const v of voicings) {
        const pcs = getPitchClasses(v);
        expect(pcs.has(0)).toBe(true); // C
        expect(pcs.has(4)).toBe(true); // E
        expect(pcs.has(7)).toBe(true); // G
      }
    });

    it("7thコードでも全コードトーンが含まれる（G7: G, B, D, F）", () => {
      const voicings = findChordPositions("G", "dominant7");
      for (const v of voicings) {
        const pcs = getPitchClasses(v);
        expect(pcs.has(7)).toBe(true); // G
        expect(pcs.has(11)).toBe(true); // B
        expect(pcs.has(2)).toBe(true); // D
        expect(pcs.has(5)).toBe(true); // F
      }
    });

    it("マイナーコードでも全コードトーンが含まれる（Am: A, C, E）", () => {
      const voicings = findChordPositions("A", "minor");
      for (const v of voicings) {
        const pcs = getPitchClasses(v);
        expect(pcs.has(9)).toBe(true); // A
        expect(pcs.has(0)).toBe(true); // C
        expect(pcs.has(4)).toBe(true); // E
      }
    });
  });

  describe("ルート弦の正しさ", () => {
    it("rootString で示された弦にルート音がある", () => {
      const voicings = findChordPositions("C", "major");
      for (const v of voicings) {
        const idx = 6 - v.rootString;
        const fret = v.frets[idx];
        expect(fret).not.toBeNull();
        if (fret === null) continue;
        const note = getNoteAtPosition(v.rootString, fret);
        expect(note.pitchClass).toBe(v.chord.root.pitchClass);
      }
    });

    it("ベース弦より低い弦はミュートされている", () => {
      const voicings = findChordPositions("C", "major");
      for (const v of voicings) {
        for (let s = 6; s > v.rootString; s--) {
          const idx = 6 - s;
          expect(v.frets[idx]).toBeNull();
        }
      }
    });

    it("6弦ルートのボイシングが含まれる", () => {
      const voicings = findChordPositions("E", "major");
      const has6thRoot = voicings.some((v) => v.rootString === 6);
      expect(has6thRoot).toBe(true);
    });

    it("5弦ルートのボイシングが含まれる", () => {
      const voicings = findChordPositions("A", "major");
      const has5thRoot = voicings.some((v) => v.rootString === 5);
      expect(has5thRoot).toBe(true);
    });

    it("4弦ルートのボイシングが含まれる", () => {
      const voicings = findChordPositions("D", "major");
      const has4thRoot = voicings.some((v) => v.rootString === 4);
      expect(has4thRoot).toBe(true);
    });
  });

  describe("演奏可能性", () => {
    it("フレットスパンが4フレット以内（開放弦除く）", () => {
      const chords = [
        ["C", "major"],
        ["G", "major"],
        ["D", "minor"],
        ["F", "major"],
        ["Bb", "major"],
        ["E", "minor7"],
      ] as const;

      for (const [root, quality] of chords) {
        const voicings = findChordPositions(root, quality);
        for (const v of voicings) {
          const fretted = v.frets.filter((f): f is number => f !== null && f > 0);
          if (fretted.length > 0) {
            const span = Math.max(...fretted) - Math.min(...fretted);
            expect(span).toBeLessThanOrEqual(3);
          }
        }
      }
    });

    it("演奏弦の間にミュート弦がない", () => {
      const voicings = findChordPositions("C", "major");
      for (const v of voicings) {
        let firstPlayed = -1;
        let lastPlayed = -1;
        for (let i = 0; i < 6; i++) {
          if (v.frets[i] !== null) {
            if (firstPlayed === -1) firstPlayed = i;
            lastPlayed = i;
          }
        }
        if (firstPlayed >= 0) {
          for (let i = firstPlayed; i <= lastPlayed; i++) {
            expect(v.frets[i]).not.toBeNull();
          }
        }
      }
    });
  });

  describe("具体的なオープンコードの検証", () => {
    it("E major: 022100 が含まれる", () => {
      const voicings = findChordPositions("E", "major");
      const fretStrings = voicings.map(toFretString);
      expect(fretStrings).toContain("022100");
    });

    it("A major: x02220 が含まれる", () => {
      const voicings = findChordPositions("A", "major");
      const fretStrings = voicings.map(toFretString);
      expect(fretStrings).toContain("x02220");
    });

    it("C major: x32010 が含まれる", () => {
      const voicings = findChordPositions("C", "major");
      const fretStrings = voicings.map(toFretString);
      expect(fretStrings).toContain("x32010");
    });

    it("D major: xx0232 が含まれる", () => {
      const voicings = findChordPositions("D", "major");
      const fretStrings = voicings.map(toFretString);
      expect(fretStrings).toContain("xx0232");
    });

    it("E minor: 022000 が含まれる", () => {
      const voicings = findChordPositions("E", "minor");
      const fretStrings = voicings.map(toFretString);
      expect(fretStrings).toContain("022000");
    });

    it("A minor: x02210 が含まれる", () => {
      const voicings = findChordPositions("A", "minor");
      const fretStrings = voicings.map(toFretString);
      expect(fretStrings).toContain("x02210");
    });

    it("D minor: xx0231 が含まれる", () => {
      const voicings = findChordPositions("D", "minor");
      const fretStrings = voicings.map(toFretString);
      expect(fretStrings).toContain("xx0231");
    });
  });

  describe("バレーコード", () => {
    it("F major の6弦ルートに barreInfo がある", () => {
      const voicings = findChordPositions("F", "major");
      const sixthStringVoicings = voicings.filter((v) => v.rootString === 6);
      const hasBarreVoicing = sixthStringVoicings.some((v) => v.barreInfo !== undefined);
      expect(hasBarreVoicing).toBe(true);
    });

    it("barreInfo の fret/fromString/toString が妥当", () => {
      const voicings = findChordPositions("F", "major");
      const barreVoicing = voicings.find((v) => v.barreInfo !== undefined);
      expect(barreVoicing).toBeDefined();
      if (barreVoicing?.barreInfo) {
        expect(barreVoicing.barreInfo.fret).toBeGreaterThanOrEqual(1);
        expect(barreVoicing.barreInfo.fromString).toBeGreaterThanOrEqual(1);
        expect(barreVoicing.barreInfo.toString).toBeLessThanOrEqual(6);
        expect(barreVoicing.barreInfo.fromString).toBeLessThanOrEqual(
          barreVoicing.barreInfo.toString
        );
      }
    });

    it("Bb major の5弦ルートにバレーコードが含まれる", () => {
      const voicings = findChordPositions("Bb", "major");
      const fifthStringVoicings = voicings.filter((v) => v.rootString === 5);
      const hasBarreVoicing = fifthStringVoicings.some((v) => v.barreInfo !== undefined);
      expect(hasBarreVoicing).toBe(true);
    });
  });

  describe("maxFret 制約", () => {
    it("maxFret を指定するとフレット範囲内のボイシングのみ返す", () => {
      const voicings = findChordPositions("C", "major", 5);
      for (const v of voicings) {
        for (const fret of v.frets) {
          if (fret !== null) {
            expect(fret).toBeLessThanOrEqual(5);
          }
        }
      }
    });

    it("maxFret が小さいと返されるボイシング数が少なくなる", () => {
      const voicingsSmall = findChordPositions("C", "major", 5);
      const voicingsFull = findChordPositions("C", "major", 12);
      expect(voicingsFull.length).toBeGreaterThanOrEqual(voicingsSmall.length);
    });
  });

  describe("多様なコードクオリティ", () => {
    it("diminished コードでもボイシングが返る", () => {
      const voicings = findChordPositions("B", "diminished");
      expect(voicings.length).toBeGreaterThan(0);
      for (const v of voicings) {
        const pcs = getPitchClasses(v);
        expect(pcs.has(11)).toBe(true); // B
        expect(pcs.has(2)).toBe(true); // D
        expect(pcs.has(5)).toBe(true); // F
      }
    });

    it("augmented コードでもボイシングが返る", () => {
      const voicings = findChordPositions("C", "augmented");
      expect(voicings.length).toBeGreaterThan(0);
    });

    it("minor7 コードでもボイシングが返る", () => {
      const voicings = findChordPositions("A", "minor7");
      expect(voicings.length).toBeGreaterThan(0);
      for (const v of voicings) {
        const pcs = getPitchClasses(v);
        expect(pcs.has(9)).toBe(true); // A
        expect(pcs.has(0)).toBe(true); // C
        expect(pcs.has(4)).toBe(true); // E
        expect(pcs.has(7)).toBe(true); // G
      }
    });

    it("major7 コードでもボイシングが返る", () => {
      const voicings = findChordPositions("C", "major7");
      expect(voicings.length).toBeGreaterThan(0);
    });

    it("minor7b5 コードでもボイシングが返る", () => {
      const voicings = findChordPositions("B", "minor7b5");
      expect(voicings.length).toBeGreaterThan(0);
    });
  });

  describe("フラット系ルートノート", () => {
    it("Bb major でボイシングが返る", () => {
      const voicings = findChordPositions("Bb", "major");
      expect(voicings.length).toBeGreaterThan(0);
    });

    it("Eb minor でボイシングが返る", () => {
      const voicings = findChordPositions("Eb", "minor");
      expect(voicings.length).toBeGreaterThan(0);
    });
  });
});
