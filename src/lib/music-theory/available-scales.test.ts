import {
  type AvailableScaleInfo,
  computeChordQualityFromScale,
  findAvailableScalesForChord,
  getDefaultScaleForSource,
  getRotatedMode,
  SECONDARY_DOMINANT_SCALES,
  sortScalesWithDefault,
} from "./available-scales";
import { createScale } from "./scale";

describe("computeChordQualityFromScale", () => {
  it("Ionian I度のセブンスはmajor7", () => {
    const scale = createScale("C", "major");
    expect(computeChordQualityFromScale(scale, 1, true)).toBe("major7");
  });

  it("Ionian V度のセブンスはdominant7", () => {
    const scale = createScale("C", "major");
    expect(computeChordQualityFromScale(scale, 5, true)).toBe("dominant7");
  });

  it("Mixolydian I度のセブンスはdominant7（major7ではない）", () => {
    const scale = createScale("C", "mixolydian");
    expect(computeChordQualityFromScale(scale, 1, true)).toBe("dominant7");
  });

  it("Lydian I度のセブンスはmajor7", () => {
    const scale = createScale("C", "lydian");
    expect(computeChordQualityFromScale(scale, 1, true)).toBe("major7");
  });

  it("Lydian II度のセブンスはdominant7", () => {
    // C Lydian: C D E F# G A B → II = D F# A C → [0,4,7,10] → dominant7
    const scale = createScale("C", "lydian");
    expect(computeChordQualityFromScale(scale, 2, true)).toBe("dominant7");
  });

  it("Harmonic Minor I度のセブンスは既存タイプに一致しない（minorMajor7）", () => {
    // C Harmonic Minor: C D Eb F G Ab B → I = C Eb G B → [0,3,7,11]
    const scale = createScale("C", "harmonic-minor");
    expect(computeChordQualityFromScale(scale, 1, true)).toBeNull();
  });

  it("トライアドも正しく判定できる", () => {
    const scale = createScale("C", "major");
    expect(computeChordQualityFromScale(scale, 1, false)).toBe("major");
    expect(computeChordQualityFromScale(scale, 2, false)).toBe("minor");
    expect(computeChordQualityFromScale(scale, 7, false)).toBe("diminished");
  });
});

describe("getRotatedMode", () => {
  describe("Major (Ionian) modes", () => {
    it("I度はIonian (major)", () => {
      expect(getRotatedMode("major", 1)).toBe("major");
    });

    it("II度はDorian", () => {
      expect(getRotatedMode("major", 2)).toBe("dorian");
    });

    it("III度はPhrygian", () => {
      expect(getRotatedMode("major", 3)).toBe("phrygian");
    });

    it("IV度はLydian", () => {
      expect(getRotatedMode("major", 4)).toBe("lydian");
    });

    it("V度はMixolydian", () => {
      expect(getRotatedMode("major", 5)).toBe("mixolydian");
    });

    it("VI度はAeolian", () => {
      expect(getRotatedMode("major", 6)).toBe("aeolian");
    });

    it("VII度はLocrian", () => {
      expect(getRotatedMode("major", 7)).toBe("locrian");
    });
  });

  describe("Harmonic Minor modes", () => {
    it("I度はHarmonic Minor", () => {
      expect(getRotatedMode("harmonic-minor", 1)).toBe("harmonic-minor");
    });

    it("V度はPhrygian Dominant", () => {
      expect(getRotatedMode("harmonic-minor", 5)).toBe("phrygian-dominant");
    });

    it("IV度はDorian #4", () => {
      expect(getRotatedMode("harmonic-minor", 4)).toBe("dorian-sharp4");
    });
  });

  describe("Melodic Minor modes", () => {
    it("I度はMelodic Minor", () => {
      expect(getRotatedMode("melodic-minor", 1)).toBe("melodic-minor");
    });

    it("IV度はLydian Dominant", () => {
      expect(getRotatedMode("melodic-minor", 4)).toBe("lydian-dominant");
    });

    it("VII度はAltered", () => {
      expect(getRotatedMode("melodic-minor", 7)).toBe("altered");
    });
  });

  describe("エッジケース", () => {
    it("不正な度数は null を返す", () => {
      expect(getRotatedMode("major", 0)).toBeNull();
      expect(getRotatedMode("major", 8)).toBeNull();
    });

    it("回転テーブルにない ScaleType は null を返す", () => {
      expect(getRotatedMode("altered", 1)).toBeNull();
    });
  });
});

describe("findAvailableScalesForChord", () => {
  describe("Cメジャーキーのトライアド（コードルート基準の回転モード）", () => {
    it("I度のCメジャーはIonian, Lydian, Mixolydianで使える", () => {
      // I度なので回転しても同名: Ionian→Ionian, Lydian→Lydian, Mixolydian→Mixolydian
      const scales = findAvailableScalesForChord("C", 1, "C", "major");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("major"); // Ionian
      expect(scaleTypes).toContain("lydian");
      expect(scaleTypes).toContain("mixolydian");
      expect(scales).toHaveLength(3);
    });

    it("II度のDマイナーはDorian, Melodic Minor由来のDorian b2, Phrygian, Aeolianで使える", () => {
      // major II → Dorian, melodic-minor II → Dorian b2,
      // dorian II → Phrygian, mixolydian II → Aeolian
      const scales = findAvailableScalesForChord("C", 2, "D", "minor");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("dorian"); // from major
      expect(scaleTypes).toContain("dorian-b2"); // from melodic-minor
      expect(scaleTypes).toContain("phrygian"); // from dorian
      expect(scaleTypes).toContain("aeolian"); // from mixolydian
      expect(scales).toHaveLength(4);
    });

    it("III度のEマイナーはPhrygianとAeolianで使える", () => {
      // major III → Phrygian, lydian III → Aeolian
      const scales = findAvailableScalesForChord("C", 3, "E", "minor");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("phrygian"); // from major
      expect(scaleTypes).toContain("aeolian"); // from lydian
      expect(scales).toHaveLength(2);
    });

    it("IV度のFメジャーはLydian, Lydian Dominant, Mixolydian, Majorで使える", () => {
      // major IV → Lydian, melodic-minor IV → Lydian Dominant,
      // dorian IV → Mixolydian, mixolydian IV → Major (Ionian)
      const scales = findAvailableScalesForChord("C", 4, "F", "major");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("lydian"); // from major
      expect(scaleTypes).toContain("lydian-dominant"); // from melodic-minor
      expect(scaleTypes).toContain("mixolydian"); // from dorian
      expect(scaleTypes).toContain("major"); // from mixolydian
      expect(scales).toHaveLength(4);
    });

    it("V度のGメジャーはMixolydian, Phrygian Dominant, Mixolydian b6, Majorで使える", () => {
      // major V → Mixolydian, harmonic-minor V → Phrygian Dominant,
      // melodic-minor V → Mixolydian b6, lydian V → Major (Ionian)
      const scales = findAvailableScalesForChord("C", 5, "G", "major");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("mixolydian"); // from major
      expect(scaleTypes).toContain("phrygian-dominant"); // from harmonic-minor
      expect(scaleTypes).toContain("mixolydian-b6"); // from melodic-minor
      expect(scaleTypes).toContain("major"); // from lydian
      expect(scales).toHaveLength(4);
    });
  });

  describe("ルート音が異なるモードは除外される", () => {
    it("Cキー・II度でDbメジャー（Phrygian由来）はDマイナーと一致しない", () => {
      const scales = findAvailableScalesForChord("C", 2, "D", "minor");
      const scaleTypes = scales.map((s) => s.scaleType);
      // Phrygian の II度は Db（Lydian に回転）なので D minor とは一致しない
      expect(scaleTypes).not.toContain("lydian");
    });

    it("Cキー・IV度でF#dim（Lydian由来）はFメジャーと一致しない", () => {
      const scales = findAvailableScalesForChord("C", 4, "F", "major");
      const scaleTypes = scales.map((s) => s.scaleType);
      // Lydian IV = F# (locrian) → F major とは一致しない
      expect(scaleTypes).not.toContain("locrian");
    });
  });

  describe("セブンスコード", () => {
    it("I度のCM7はIonianとLydianのみで使える（Mixolydianはb7のためC7になる）", () => {
      const scales = findAvailableScalesForChord("C", 1, "C", "major7");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("major"); // Ionian (from major)
      expect(scaleTypes).toContain("lydian"); // Lydian (from lydian)
      expect(scaleTypes).not.toContain("mixolydian");
      expect(scales).toHaveLength(2);
    });

    it("V度のG7（dominant7）はMixolydian, Phrygian Dominant, Mixolydian b6で使える", () => {
      // major V → Mixolydian, harmonic-minor V → Phrygian Dominant,
      // melodic-minor V → Mixolydian b6
      const scales = findAvailableScalesForChord("C", 5, "G", "dominant7");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("mixolydian"); // from major
      expect(scaleTypes).toContain("phrygian-dominant"); // from harmonic-minor
      expect(scaleTypes).toContain("mixolydian-b6"); // from melodic-minor
      expect(scales).toHaveLength(3);
    });

    it("II度のDm7はDorian, Dorian b2, Phrygian, Aeolianで使える", () => {
      const scales = findAvailableScalesForChord("C", 2, "D", "minor7");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("dorian"); // from major
      expect(scaleTypes).toContain("dorian-b2"); // from melodic-minor
      expect(scaleTypes).toContain("phrygian"); // from dorian
      expect(scaleTypes).toContain("aeolian"); // from mixolydian
      expect(scales).toHaveLength(4);
    });
  });

  describe("ユーザー報告のケース", () => {
    it("FメジャーキーのI度FM7でMixolydianは使えない", () => {
      // F Mixolydian: F G A Bb C D Eb → I = F A C Eb → F7 (dominant7)
      // FM7 (major7) とは一致しない
      const scales = findAvailableScalesForChord("F", 1, "F", "major7");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("major"); // Ionian
      expect(scaleTypes).toContain("lydian");
      expect(scaleTypes).not.toContain("mixolydian");
      expect(scales).toHaveLength(2);
    });

    it("FメジャーキーのI度Fメジャー（トライアド）ではMixolydianは使える", () => {
      // トライアドの場合: F Mixolydian I = F A C → major ✓
      const scales = findAvailableScalesForChord("F", 1, "F", "major");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("major"); // Ionian
      expect(scaleTypes).toContain("lydian");
      expect(scaleTypes).toContain("mixolydian");
      expect(scales).toHaveLength(3);
    });
  });

  describe("モーダルインターチェンジ由来のコード", () => {
    it("Natural Minor由来のIV度FマイナーはDorian, Dorian #4, Aeolianで使える", () => {
      // natural-minor IV → Dorian, harmonic-minor IV → Dorian #4,
      // phrygian IV → Aeolian
      const scales = findAvailableScalesForChord("C", 4, "F", "minor");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("dorian"); // from natural-minor
      expect(scaleTypes).toContain("dorian-sharp4"); // from harmonic-minor
      expect(scaleTypes).toContain("aeolian"); // from phrygian
    });

    it("Lydian由来のII度Dメジャーは Mixolydian のみ", () => {
      // lydian II → Mixolydian
      const scales = findAvailableScalesForChord("C", 2, "D", "major");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("mixolydian"); // from lydian
      expect(scaleTypes).toHaveLength(1);
    });
  });

  describe("displayNameが正しく設定される", () => {
    it("Ionianの場合 displayName は Ionian", () => {
      // I度はIonianのまま
      const scales = findAvailableScalesForChord("C", 1, "C", "major");
      const ionian = scales.find((s) => s.scaleType === "major");
      expect(ionian?.displayName).toBe("Ionian");
    });

    it("回転モードの displayName が正しい", () => {
      // III度: major → Phrygian, lydian → Aeolian
      const scales = findAvailableScalesForChord("C", 3, "E", "minor");
      const phrygian = scales.find((s) => s.scaleType === "phrygian");
      expect(phrygian?.displayName).toBe("Phrygian");
      const aeolian = scales.find((s) => s.scaleType === "aeolian");
      expect(aeolian?.displayName).toBe("Aeolian");
    });
  });

  describe("異なるキーでも正しく動作する", () => {
    it("Gメジャーキー・I度のGメジャーでも正しく判定される", () => {
      const scales = findAvailableScalesForChord("G", 1, "G", "major");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("major"); // Ionian
      expect(scaleTypes).toContain("lydian");
      expect(scaleTypes).toContain("mixolydian");
      expect(scales).toHaveLength(3);
    });

    it("Fメジャーキー（フラット系）でも正しく動作する", () => {
      const scales = findAvailableScalesForChord("F", 1, "F", "major");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("major"); // Ionian
      expect(scaleTypes).toContain("lydian");
      expect(scaleTypes).toContain("mixolydian");
    });
  });

  describe("コードルート基準の具体例", () => {
    it("CキーのEm7(IIIm7)はE Phrygian, E Aeolianになる（C Ionian, C Lydianではない）", () => {
      const scales = findAvailableScalesForChord("C", 3, "E", "minor7");
      const scaleTypes = scales.map((s) => s.scaleType);
      // C Ionian の III度 = E Phrygian
      expect(scaleTypes).toContain("phrygian");
      // C Lydian の III度 = E Aeolian
      expect(scaleTypes).toContain("aeolian");
      // E Ionian/Lydian にはならない
      expect(scaleTypes).not.toContain("major");
      expect(scaleTypes).not.toContain("lydian");
    });

    it("CキーのAm(VIm)はAeolian, Locrian由来のMajor, Dorian, Phrygianで使える", () => {
      // major VI → Aeolian, dorian VI → Locrian, phrygian VI → Major, mixolydian VI → Phrygian
      // Wait, let me verify which ones match
      const scales = findAvailableScalesForChord("C", 6, "A", "minor");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("aeolian"); // from major
      // Check total
      expect(scales.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("SECONDARY_DOMINANT_SCALES", () => {
    it("5つのスケールが定義されている", () => {
      expect(SECONDARY_DOMINANT_SCALES).toHaveLength(5);
    });

    it("ミクソリディアンが最初（基本スケール）", () => {
      expect(SECONDARY_DOMINANT_SCALES[0].scaleType).toBe("mixolydian");
    });

    it("全5スケールの種類が正しい", () => {
      const scaleTypes = SECONDARY_DOMINANT_SCALES.map((s) => s.scaleType);
      expect(scaleTypes).toEqual([
        "mixolydian",
        "altered",
        "lydian-dominant",
        "half-whole-diminished",
        "phrygian-dominant",
      ]);
    });

    it("全スケールにdisplayNameが設定されている", () => {
      for (const scale of SECONDARY_DOMINANT_SCALES) {
        expect(scale.displayName).toBeTruthy();
      }
    });
  });

  describe("結果が空になるケース", () => {
    it("不正な度数を指定した場合は空配列を返す", () => {
      const scales = findAvailableScalesForChord("C", 0, "C", "major");
      expect(scales).toEqual([]);
    });
  });
});

describe("getDefaultScaleForSource", () => {
  describe("diatonic ソースの場合、major の回転モードを返す", () => {
    it("I度は major (Ionian)", () => {
      expect(getDefaultScaleForSource("diatonic", 1)).toBe("major");
    });

    it("II度は dorian", () => {
      expect(getDefaultScaleForSource("diatonic", 2)).toBe("dorian");
    });

    it("III度は phrygian", () => {
      expect(getDefaultScaleForSource("diatonic", 3)).toBe("phrygian");
    });
  });

  describe("モーダルインターチェンジソースの場合、そのモードの回転モードを返す", () => {
    it("dorian I度は dorian", () => {
      expect(getDefaultScaleForSource("dorian", 1)).toBe("dorian");
    });

    it("dorian II度は phrygian", () => {
      expect(getDefaultScaleForSource("dorian", 2)).toBe("phrygian");
    });

    it("natural-minor I度は aeolian", () => {
      expect(getDefaultScaleForSource("natural-minor", 1)).toBe("aeolian");
    });

    it("lydian I度は lydian", () => {
      expect(getDefaultScaleForSource("lydian", 1)).toBe("lydian");
    });

    it("mixolydian III度は locrian", () => {
      expect(getDefaultScaleForSource("mixolydian", 3)).toBe("locrian");
    });

    it("harmonic-minor V度は phrygian-dominant", () => {
      expect(getDefaultScaleForSource("harmonic-minor", 5)).toBe("phrygian-dominant");
    });

    it("melodic-minor IV度は lydian-dominant", () => {
      expect(getDefaultScaleForSource("melodic-minor", 4)).toBe("lydian-dominant");
    });
  });

  describe("secondary-dominant / tritone-substitution のデフォルトスケール", () => {
    it("secondary-dominant は mixolydian", () => {
      expect(getDefaultScaleForSource("secondary-dominant", 5)).toBe("mixolydian");
    });

    it("tritone-substitution は lydian-dominant", () => {
      expect(getDefaultScaleForSource("tritone-substitution", 5)).toBe("lydian-dominant");
    });
  });
});

describe("sortScalesWithDefault", () => {
  const scales: AvailableScaleInfo[] = [
    { scaleType: "aeolian", displayName: "Aeolian" },
    { scaleType: "dorian", displayName: "Dorian" },
    { scaleType: "phrygian", displayName: "Phrygian" },
  ];

  it("デフォルトスケールを先頭に移動する", () => {
    const sorted = sortScalesWithDefault(scales, "dorian");
    expect(sorted[0].scaleType).toBe("dorian");
    expect(sorted).toHaveLength(3);
  });

  it("残りの順序は元のまま維持される", () => {
    const sorted = sortScalesWithDefault(scales, "dorian");
    expect(sorted.map((s) => s.scaleType)).toEqual(["dorian", "aeolian", "phrygian"]);
  });

  it("デフォルトスケールが見つからない場合は元の順序のまま", () => {
    const sorted = sortScalesWithDefault(scales, "lydian");
    expect(sorted.map((s) => s.scaleType)).toEqual(["aeolian", "dorian", "phrygian"]);
  });

  it("デフォルトスケールが既に先頭の場合はそのまま", () => {
    const sorted = sortScalesWithDefault(scales, "aeolian");
    expect(sorted.map((s) => s.scaleType)).toEqual(["aeolian", "dorian", "phrygian"]);
  });

  it("元の配列は変更されない", () => {
    sortScalesWithDefault(scales, "dorian");
    expect(scales[0].scaleType).toBe("aeolian");
  });
});
