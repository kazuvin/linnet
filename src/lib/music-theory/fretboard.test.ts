import {
  findChordPositions,
  findNotePositions,
  findOverlayPositions,
  findScalePositions,
  getCommonVoicings,
  getNoteAtPosition,
  STANDARD_TUNING,
} from "./fretboard";

describe("fretboard", () => {
  describe("STANDARD_TUNING", () => {
    it("標準チューニングは6弦から1弦の順で E, A, D, G, B, E", () => {
      expect(STANDARD_TUNING).toEqual(["E", "A", "D", "G", "B", "E"]);
    });

    it("6要素である", () => {
      expect(STANDARD_TUNING).toHaveLength(6);
    });
  });

  describe("getNoteAtPosition", () => {
    it("6弦開放 = E", () => {
      const note = getNoteAtPosition(6, 0);
      expect(note.name).toBe("E");
    });

    it("5弦開放 = A", () => {
      const note = getNoteAtPosition(5, 0);
      expect(note.name).toBe("A");
    });

    it("4弦開放 = D", () => {
      const note = getNoteAtPosition(4, 0);
      expect(note.name).toBe("D");
    });

    it("3弦開放 = G", () => {
      const note = getNoteAtPosition(3, 0);
      expect(note.name).toBe("G");
    });

    it("2弦開放 = B", () => {
      const note = getNoteAtPosition(2, 0);
      expect(note.name).toBe("B");
    });

    it("1弦開放 = E（高い方）", () => {
      const note = getNoteAtPosition(1, 0);
      expect(note.name).toBe("E");
    });

    it("6弦5フレット = A", () => {
      const note = getNoteAtPosition(6, 5);
      expect(note.name).toBe("A");
    });

    it("6弦12フレット = E（1オクターブ上）", () => {
      const note = getNoteAtPosition(6, 12);
      expect(note.name).toBe("E");
    });

    it("1弦5フレット = A", () => {
      const note = getNoteAtPosition(1, 5);
      expect(note.name).toBe("A");
    });

    it("3弦2フレット = A", () => {
      const note = getNoteAtPosition(3, 2);
      expect(note.name).toBe("A");
    });

    it("6弦1フレット = F", () => {
      const note = getNoteAtPosition(6, 1);
      expect(note.name).toBe("F");
    });

    it("5弦3フレット = C", () => {
      const note = getNoteAtPosition(5, 3);
      expect(note.name).toBe("C");
    });

    it("カスタムチューニングで動作する", () => {
      // ドロップDチューニング: [D, A, D, G, B, E]
      const dropD = ["D", "A", "D", "G", "B", "E"] as const;
      const note = getNoteAtPosition(6, 0, dropD);
      expect(note.name).toBe("D");
    });

    it("ピッチクラスが正しい", () => {
      const note = getNoteAtPosition(6, 0);
      expect(note.pitchClass).toBe(4); // E = pitchClass 4
    });
  });

  describe("findNotePositions", () => {
    it("Eは各弦に必ず1つ以上ある", () => {
      const positions = findNotePositions("E");
      // 6本の弦それぞれにEが存在するか確認
      for (let s = 1; s <= 6; s++) {
        const hasE = positions.some((p) => p.string === s);
        expect(hasE).toBe(true);
      }
    });

    it("12フレットまでで同じ音が複数ポジションに存在する", () => {
      const positions = findNotePositions("A");
      // Aは少なくとも6個以上（各弦に1つ以上）
      expect(positions.length).toBeGreaterThanOrEqual(6);
    });

    it("返されるポジションのnoteが全て指定した音のピッチクラスを持つ", () => {
      const positions = findNotePositions("C");
      for (const pos of positions) {
        expect(pos.note.pitchClass).toBe(0); // C = pitchClass 0
      }
    });

    it("maxFretを指定できる", () => {
      const positions = findNotePositions("E", 5);
      for (const pos of positions) {
        expect(pos.fret).toBeLessThanOrEqual(5);
      }
    });

    it("デフォルトのmaxFretは12", () => {
      const positions = findNotePositions("E");
      for (const pos of positions) {
        expect(pos.fret).toBeLessThanOrEqual(12);
      }
    });

    it("弦番号は1-6の範囲", () => {
      const positions = findNotePositions("G");
      for (const pos of positions) {
        expect(pos.string).toBeGreaterThanOrEqual(1);
        expect(pos.string).toBeLessThanOrEqual(6);
      }
    });

    it("5弦開放のAが含まれる", () => {
      const positions = findNotePositions("A");
      const has5thOpen = positions.some((p) => p.string === 5 && p.fret === 0);
      expect(has5thOpen).toBe(true);
    });

    it("フラット表記の音名でも検索できる", () => {
      const positions = findNotePositions("Bb");
      expect(positions.length).toBeGreaterThan(0);
      for (const pos of positions) {
        expect(pos.note.pitchClass).toBe(10); // Bb = pitchClass 10
      }
    });
  });

  describe("findScalePositions", () => {
    it("Cメジャースケールの構成音がポジションに含まれる", () => {
      const positions = findScalePositions("C", "major");
      const pitchClasses = new Set(positions.map((p) => p.note.pitchClass));
      // Cメジャースケール: C(0), D(2), E(4), F(5), G(7), A(9), B(11)
      expect(pitchClasses.has(0)).toBe(true); // C
      expect(pitchClasses.has(2)).toBe(true); // D
      expect(pitchClasses.has(4)).toBe(true); // E
      expect(pitchClasses.has(5)).toBe(true); // F
      expect(pitchClasses.has(7)).toBe(true); // G
      expect(pitchClasses.has(9)).toBe(true); // A
      expect(pitchClasses.has(11)).toBe(true); // B
    });

    it("Cメジャースケール外の音が含まれない", () => {
      const positions = findScalePositions("C", "major");
      const cMajorPitchClasses = new Set([0, 2, 4, 5, 7, 9, 11]);
      for (const pos of positions) {
        expect(cMajorPitchClasses.has(pos.note.pitchClass)).toBe(true);
      }
    });

    it("maxFretを指定できる", () => {
      const positions = findScalePositions("C", "major", 5);
      for (const pos of positions) {
        expect(pos.fret).toBeLessThanOrEqual(5);
      }
    });

    it("マイナースケールでも動作する", () => {
      const positions = findScalePositions("A", "natural-minor");
      const pitchClasses = new Set(positions.map((p) => p.note.pitchClass));
      // Aナチュラルマイナー: A(9), B(11), C(0), D(2), E(4), F(5), G(7)
      expect(pitchClasses.has(9)).toBe(true); // A
      expect(pitchClasses.has(11)).toBe(true); // B
      expect(pitchClasses.has(0)).toBe(true); // C
      expect(pitchClasses.has(2)).toBe(true); // D
      expect(pitchClasses.has(4)).toBe(true); // E
      expect(pitchClasses.has(5)).toBe(true); // F
      expect(pitchClasses.has(7)).toBe(true); // G
    });

    it("ポジション数はスケール構成音の数に6弦を掛けた数以下", () => {
      const positions = findScalePositions("C", "major");
      // 7音 x 6弦 = 42 以下（12フレットまで、各弦で各音は最大2回出現）
      expect(positions.length).toBeLessThanOrEqual(7 * 6 * 2);
      expect(positions.length).toBeGreaterThan(0);
    });
  });

  describe("findChordPositions", () => {
    it("Cメジャーの構成音（C, E, G）がポジションに含まれる", () => {
      const positions = findChordPositions("C", "major");
      const pitchClasses = new Set(positions.map((p) => p.note.pitchClass));
      expect(pitchClasses.has(0)).toBe(true); // C
      expect(pitchClasses.has(4)).toBe(true); // E
      expect(pitchClasses.has(7)).toBe(true); // G
    });

    it("Cメジャーの構成音以外が含まれない", () => {
      const positions = findChordPositions("C", "major");
      const cMajorPitchClasses = new Set([0, 4, 7]);
      for (const pos of positions) {
        expect(cMajorPitchClasses.has(pos.note.pitchClass)).toBe(true);
      }
    });

    it("Amの構成音（A, C, E）がポジションに含まれる", () => {
      const positions = findChordPositions("A", "minor");
      const pitchClasses = new Set(positions.map((p) => p.note.pitchClass));
      expect(pitchClasses.has(9)).toBe(true); // A
      expect(pitchClasses.has(0)).toBe(true); // C
      expect(pitchClasses.has(4)).toBe(true); // E
    });

    it("maxFretを指定できる", () => {
      const positions = findChordPositions("C", "major", 5);
      for (const pos of positions) {
        expect(pos.fret).toBeLessThanOrEqual(5);
      }
    });

    it("7thコードでも動作する", () => {
      const positions = findChordPositions("G", "dominant7");
      const pitchClasses = new Set(positions.map((p) => p.note.pitchClass));
      // G7: G(7), B(11), D(2), F(5)
      expect(pitchClasses.has(7)).toBe(true); // G
      expect(pitchClasses.has(11)).toBe(true); // B
      expect(pitchClasses.has(2)).toBe(true); // D
      expect(pitchClasses.has(5)).toBe(true); // F
    });
  });

  describe("getCommonVoicings", () => {
    it("Cメジャーのオープンコードが返る", () => {
      const voicings = getCommonVoicings("C", "major");
      expect(voicings.length).toBeGreaterThan(0);
    });

    it("各ボイシングにchordプロパティがある", () => {
      const voicings = getCommonVoicings("C", "major");
      for (const voicing of voicings) {
        expect(voicing.chord).toBeDefined();
        expect(voicing.chord.root.name).toBe("C");
        expect(voicing.chord.quality).toBe("major");
      }
    });

    it("各ボイシングのpositionsが妥当", () => {
      const voicings = getCommonVoicings("C", "major");
      for (const voicing of voicings) {
        expect(voicing.positions.length).toBeGreaterThanOrEqual(3);
        expect(voicing.positions.length).toBeLessThanOrEqual(6);
        for (const pos of voicing.positions) {
          expect(pos.string).toBeGreaterThanOrEqual(1);
          expect(pos.string).toBeLessThanOrEqual(6);
          expect(pos.fret).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it("Gメジャーのボイシングが返る", () => {
      const voicings = getCommonVoicings("G", "major");
      expect(voicings.length).toBeGreaterThan(0);
    });

    it("Amのボイシングが返る", () => {
      const voicings = getCommonVoicings("A", "minor");
      expect(voicings.length).toBeGreaterThan(0);
    });

    it("Fメジャーのバレーコードが返る", () => {
      const voicings = getCommonVoicings("F", "major");
      expect(voicings.length).toBeGreaterThan(0);
      // バレーコード情報があるボイシングが含まれるか
      const hasBarreVoicing = voicings.some((v) => v.barreInfo !== undefined);
      expect(hasBarreVoicing).toBe(true);
    });

    it("バレーコードのbarreInfoが妥当", () => {
      const voicings = getCommonVoicings("F", "major");
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

    it("Emのボイシングが返る", () => {
      const voicings = getCommonVoicings("E", "minor");
      expect(voicings.length).toBeGreaterThan(0);
    });

    it("Dメジャーのボイシングが返る", () => {
      const voicings = getCommonVoicings("D", "major");
      expect(voicings.length).toBeGreaterThan(0);
    });

    it("Bマイナーのバレーコードが返る", () => {
      const voicings = getCommonVoicings("B", "minor");
      expect(voicings.length).toBeGreaterThan(0);
    });

    it("対応していないコードでは空配列を返す", () => {
      const voicings = getCommonVoicings("C", "diminished");
      expect(voicings).toEqual([]);
    });
  });

  describe("findOverlayPositions", () => {
    it("スケール音にはscaleロールが付与される", () => {
      // C major スケール + C major コード
      const positions = findOverlayPositions("C", "major", "C", "major", 12);
      const scaleOnlyPositions = positions.filter((p) => p.role === "scale");
      // C major スケール (C,D,E,F,G,A,B) からコード構成音 (C,E,G) を除いた D,F,A,B がscale
      expect(scaleOnlyPositions.length).toBeGreaterThan(0);
      const scaleOnlyPitchClasses = new Set(scaleOnlyPositions.map((p) => p.note.pitchClass));
      expect(scaleOnlyPitchClasses.has(2)).toBe(true); // D
      expect(scaleOnlyPitchClasses.has(5)).toBe(true); // F
      expect(scaleOnlyPitchClasses.has(9)).toBe(true); // A
      expect(scaleOnlyPitchClasses.has(11)).toBe(true); // B
    });

    it("コードのルートにはchord-rootロールが付与される", () => {
      const positions = findOverlayPositions("C", "major", "C", "major", 12);
      const rootPositions = positions.filter((p) => p.role === "chord-root");
      expect(rootPositions.length).toBeGreaterThan(0);
      // 全ルートポジションのピッチクラスがC(0)であること
      for (const pos of rootPositions) {
        expect(pos.note.pitchClass).toBe(0);
      }
    });

    it("コード構成音（ルート以外）にはchord-toneロールが付与される", () => {
      const positions = findOverlayPositions("C", "major", "C", "major", 12);
      const chordTonePositions = positions.filter((p) => p.role === "chord-tone");
      expect(chordTonePositions.length).toBeGreaterThan(0);
      // E(4) と G(7) がchord-toneに含まれること
      const pitchClasses = new Set(chordTonePositions.map((p) => p.note.pitchClass));
      expect(pitchClasses.has(4)).toBe(true); // E
      expect(pitchClasses.has(7)).toBe(true); // G
    });

    it("コード構成音がスケール音より優先される", () => {
      const positions = findOverlayPositions("C", "major", "C", "major", 12);
      // C,E,Gのポジションにscaleロールがないこと
      const cegPositions = positions.filter((p) => [0, 4, 7].includes(p.note.pitchClass));
      for (const pos of cegPositions) {
        expect(pos.role).not.toBe("scale");
      }
    });

    it("キーCでnatural-minor + Eb major7のオーバーレイが正しい", () => {
      // ユーザーの例: キーC, ⅢM7 (natural minor) の E♭M7
      // C natural minor scale: C(0), D(2), Eb(3), F(5), G(7), Ab(8), Bb(10)
      // Eb major7 構成音: Eb(3), G(7), Bb(10), D(2)
      const positions = findOverlayPositions("C", "natural-minor", "Eb", "major7", 12);

      const rootPositions = positions.filter((p) => p.role === "chord-root");
      const chordTonePositions = positions.filter((p) => p.role === "chord-tone");
      const scalePositions = positions.filter((p) => p.role === "scale");

      // ルートは Eb(3)
      for (const pos of rootPositions) {
        expect(pos.note.pitchClass).toBe(3);
      }

      // コード構成音はG(7), Bb(10), D(2)
      const chordTonePCs = new Set(chordTonePositions.map((p) => p.note.pitchClass));
      expect(chordTonePCs.has(7)).toBe(true); // G
      expect(chordTonePCs.has(10)).toBe(true); // Bb
      expect(chordTonePCs.has(2)).toBe(true); // D

      // スケール音（コード構成音を除く）: C(0), F(5), Ab(8)
      const scalePCs = new Set(scalePositions.map((p) => p.note.pitchClass));
      expect(scalePCs.has(0)).toBe(true); // C
      expect(scalePCs.has(5)).toBe(true); // F
      expect(scalePCs.has(8)).toBe(true); // Ab
    });

    it("コード構成音がスケール外の音を含む場合もchord-tone/chord-rootになる", () => {
      // C major スケールに対して Db major コード (Db, F, Ab)
      // Db(1)とAb(8)はCメジャースケール外
      const positions = findOverlayPositions("C", "major", "Db", "major", 12);

      const rootPositions = positions.filter((p) => p.role === "chord-root");
      expect(rootPositions.length).toBeGreaterThan(0);
      for (const pos of rootPositions) {
        expect(pos.note.pitchClass).toBe(1); // Db
      }

      // F(5)はスケール内だがコード構成音なのでchord-tone
      const fPositions = positions.filter((p) => p.note.pitchClass === 5);
      for (const pos of fPositions) {
        expect(pos.role).toBe("chord-tone");
      }

      // Ab(8)はスケール外だがコード構成音なのでchord-tone
      const abPositions = positions.filter((p) => p.note.pitchClass === 8);
      for (const pos of abPositions) {
        expect(pos.role).toBe("chord-tone");
      }
    });

    it("maxFretが反映される", () => {
      const positions5 = findOverlayPositions("C", "major", "C", "major", 5);
      const positions12 = findOverlayPositions("C", "major", "C", "major", 12);
      for (const pos of positions5) {
        expect(pos.fret).toBeLessThanOrEqual(5);
      }
      expect(positions12.length).toBeGreaterThan(positions5.length);
    });

    it("各ポジションが一意である（同じstring-fretの重複がない）", () => {
      const positions = findOverlayPositions("C", "major", "C", "major", 12);
      const keys = positions.map((p) => `${p.string}-${p.fret}`);
      const uniqueKeys = new Set(keys);
      expect(keys.length).toBe(uniqueKeys.size);
    });
  });
});
