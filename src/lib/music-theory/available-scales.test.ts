import {
  computeChordQualityFromScale,
  findAvailableScalesForChord,
  SECONDARY_DOMINANT_SCALES,
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

describe("findAvailableScalesForChord", () => {
  describe("Cメジャーキーのトライアド", () => {
    it("I度のCメジャーはIonian, Lydian, Mixolydianで使える", () => {
      const scales = findAvailableScalesForChord("C", 1, "C", "major");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("major");
      expect(scaleTypes).toContain("lydian");
      expect(scaleTypes).toContain("mixolydian");
      expect(scales).toHaveLength(3);
    });

    it("II度のDマイナーはIonian, Melodic Minor, Dorian, Mixolydianで使える", () => {
      const scales = findAvailableScalesForChord("C", 2, "D", "minor");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("major");
      expect(scaleTypes).toContain("melodic-minor");
      expect(scaleTypes).toContain("dorian");
      expect(scaleTypes).toContain("mixolydian");
      expect(scales).toHaveLength(4);
    });

    it("III度のEマイナーはIonianとLydianで使える", () => {
      const scales = findAvailableScalesForChord("C", 3, "E", "minor");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("major");
      expect(scaleTypes).toContain("lydian");
      expect(scales).toHaveLength(2);
    });

    it("IV度のFメジャーはIonian, Melodic Minor, Dorian, Mixolydianで使える", () => {
      const scales = findAvailableScalesForChord("C", 4, "F", "major");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("major");
      expect(scaleTypes).toContain("melodic-minor");
      expect(scaleTypes).toContain("dorian");
      expect(scaleTypes).toContain("mixolydian");
      expect(scales).toHaveLength(4);
    });

    it("V度のGメジャーはIonian, Harmonic Minor, Melodic Minor, Lydianで使える", () => {
      const scales = findAvailableScalesForChord("C", 5, "G", "major");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("major");
      expect(scaleTypes).toContain("harmonic-minor");
      expect(scaleTypes).toContain("melodic-minor");
      expect(scaleTypes).toContain("lydian");
      expect(scales).toHaveLength(4);
    });
  });

  describe("ルート音が異なるモードは除外される", () => {
    it("Cキー・II度でDbメジャー（Phrygian由来）はDマイナーと一致しない", () => {
      const scales = findAvailableScalesForChord("C", 2, "D", "minor");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).not.toContain("phrygian");
    });

    it("Cキー・IV度でF#dim（Lydian由来）はFメジャーと一致しない", () => {
      const scales = findAvailableScalesForChord("C", 4, "F", "major");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).not.toContain("lydian");
    });
  });

  describe("セブンスコード", () => {
    it("I度のCM7はIonianとLydianのみで使える（Mixolydianはb7のためC7になる）", () => {
      const scales = findAvailableScalesForChord("C", 1, "C", "major7");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("major");
      expect(scaleTypes).toContain("lydian");
      expect(scaleTypes).not.toContain("mixolydian");
      expect(scales).toHaveLength(2);
    });

    it("V度のG7（dominant7）はIonian, Harmonic Minor, Melodic Minorで使える", () => {
      // Ionian V7 = G B D F → dominant7
      // Harmonic Minor V7 = G B D F → dominant7
      // Melodic Minor V7 = G B D F → dominant7
      const scales = findAvailableScalesForChord("C", 5, "G", "dominant7");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("major");
      expect(scaleTypes).toContain("harmonic-minor");
      expect(scaleTypes).toContain("melodic-minor");
      expect(scales).toHaveLength(3);
    });

    it("II度のDm7はIonian, Melodic Minor, Dorian, Mixolydianで使える", () => {
      const scales = findAvailableScalesForChord("C", 2, "D", "minor7");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("major");
      expect(scaleTypes).toContain("melodic-minor");
      expect(scaleTypes).toContain("dorian");
      expect(scaleTypes).toContain("mixolydian");
      expect(scales).toHaveLength(4);
    });
  });

  describe("ユーザー報告のケース", () => {
    it("FメジャーキーのI度FM7でMixolydianは使えない", () => {
      // F Mixolydian: F G A Bb C D Eb → I = F A C Eb → F7 (dominant7)
      // FM7 (major7) とは一致しない
      const scales = findAvailableScalesForChord("F", 1, "F", "major7");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("major");
      expect(scaleTypes).toContain("lydian");
      expect(scaleTypes).not.toContain("mixolydian");
      expect(scales).toHaveLength(2);
    });

    it("FメジャーキーのI度Fメジャー（トライアド）ではMixolydianは使える", () => {
      // トライアドの場合: F Mixolydian I = F A C → major ✓
      const scales = findAvailableScalesForChord("F", 1, "F", "major");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("major");
      expect(scaleTypes).toContain("lydian");
      expect(scaleTypes).toContain("mixolydian");
      expect(scales).toHaveLength(3);
    });
  });

  describe("モーダルインターチェンジ由来のコード", () => {
    it("Natural Minor由来のIV度Fマイナーは Natural Minor, Harmonic Minor, Phrygian で使える", () => {
      const scales = findAvailableScalesForChord("C", 4, "F", "minor");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("natural-minor");
      expect(scaleTypes).toContain("harmonic-minor");
      expect(scaleTypes).toContain("phrygian");
    });

    it("Lydian由来のII度Dメジャーは Lydian のみ", () => {
      const scales = findAvailableScalesForChord("C", 2, "D", "major");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("lydian");
      expect(scaleTypes).toHaveLength(1);
    });
  });

  describe("displayNameが正しく設定される", () => {
    it("Ionianの場合 displayName は Ionian", () => {
      const scales = findAvailableScalesForChord("C", 1, "C", "major");
      const ionian = scales.find((s) => s.scaleType === "major");
      expect(ionian?.displayName).toBe("Ionian");
    });

    it("各モードの displayName が正しい", () => {
      const scales = findAvailableScalesForChord("C", 1, "C", "major");
      const lydian = scales.find((s) => s.scaleType === "lydian");
      expect(lydian?.displayName).toBe("Lydian");
      const mixolydian = scales.find((s) => s.scaleType === "mixolydian");
      expect(mixolydian?.displayName).toBe("Mixolydian");
    });
  });

  describe("異なるキーでも正しく動作する", () => {
    it("Gメジャーキー・I度のGメジャーでも正しく判定される", () => {
      const scales = findAvailableScalesForChord("G", 1, "G", "major");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("major");
      expect(scaleTypes).toContain("lydian");
      expect(scaleTypes).toContain("mixolydian");
      expect(scales).toHaveLength(3);
    });

    it("Fメジャーキー（フラット系）でも正しく動作する", () => {
      const scales = findAvailableScalesForChord("F", 1, "F", "major");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("major");
      expect(scaleTypes).toContain("lydian");
      expect(scaleTypes).toContain("mixolydian");
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
