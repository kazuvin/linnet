import { CHARACTERISTIC_INTERVALS, getCharacteristicPitchClasses } from "./characteristic-notes";
import type { PitchClass } from "./note";
import { SCALE_TYPES } from "./scale";

describe("characteristic-notes", () => {
  describe("CHARACTERISTIC_INTERVALS", () => {
    it("全スケールタイプに対して特性音が定義されている", () => {
      for (const scaleType of SCALE_TYPES) {
        expect(CHARACTERISTIC_INTERVALS[scaleType]).toBeDefined();
        expect(Array.isArray(CHARACTERISTIC_INTERVALS[scaleType])).toBe(true);
      }
    });

    it("全ての特性音インターバルが0-11の範囲内", () => {
      for (const [, intervals] of Object.entries(CHARACTERISTIC_INTERVALS)) {
        for (const interval of intervals) {
          expect(interval).toBeGreaterThanOrEqual(0);
          expect(interval).toBeLessThanOrEqual(11);
        }
      }
    });

    it("特性音インターバルにルート(0)は含まれない", () => {
      for (const [, intervals] of Object.entries(CHARACTERISTIC_INTERVALS)) {
        expect(intervals).not.toContain(0);
      }
    });

    // チャーチモード
    it("イオニアン(メジャー)の特性音は P4（5半音）", () => {
      expect(CHARACTERISTIC_INTERVALS.major).toEqual([5]);
    });

    it("ドリアンの特性音は M6（9半音）", () => {
      expect(CHARACTERISTIC_INTERVALS.dorian).toEqual([9]);
    });

    it("フリジアンの特性音は m2（1半音）", () => {
      expect(CHARACTERISTIC_INTERVALS.phrygian).toEqual([1]);
    });

    it("リディアンの特性音は #4（6半音）", () => {
      expect(CHARACTERISTIC_INTERVALS.lydian).toEqual([6]);
    });

    it("ミクソリディアンの特性音は b7（10半音）", () => {
      expect(CHARACTERISTIC_INTERVALS.mixolydian).toEqual([10]);
    });

    it("エオリアンの特性音は b6（8半音）", () => {
      expect(CHARACTERISTIC_INTERVALS.aeolian).toEqual([8]);
    });

    it("ロクリアンの特性音は b5（6半音）", () => {
      expect(CHARACTERISTIC_INTERVALS.locrian).toEqual([6]);
    });

    // ハーモニックマイナー系
    it("ハーモニックマイナーの特性音は M7（11半音）", () => {
      expect(CHARACTERISTIC_INTERVALS["harmonic-minor"]).toEqual([11]);
    });

    // メロディックマイナー系
    it("メロディックマイナーの特性音は M6（9半音）と M7（11半音）", () => {
      expect(CHARACTERISTIC_INTERVALS["melodic-minor"]).toEqual([9, 11]);
    });

    // リディアンドミナントの特性音は #4 と b7
    it("リディアンドミナントの特性音は #4（6半音）と b7（10半音）", () => {
      expect(CHARACTERISTIC_INTERVALS["lydian-dominant"]).toEqual([6, 10]);
    });

    // フリジアンドミナントの特性音は b2 と M3
    it("フリジアンドミナントの特性音は b2（1半音）と M3（4半音）", () => {
      expect(CHARACTERISTIC_INTERVALS["phrygian-dominant"]).toEqual([1, 4]);
    });

    // オルタードの特性音は b2 と b5
    it("オルタードの特性音は b2（1半音）と b5（6半音）", () => {
      expect(CHARACTERISTIC_INTERVALS.altered).toEqual([1, 6]);
    });
  });

  describe("getCharacteristicPitchClasses", () => {
    it("Cメジャーの特性音はF（ピッチクラス5）", () => {
      const result = getCharacteristicPitchClasses("C", "major");
      expect(result).toEqual(new Set<PitchClass>([5]));
    });

    it("Dドリアンの特性音はB（ピッチクラス11）", () => {
      // D=2, M6は9半音上 → 2+9=11 → B
      const result = getCharacteristicPitchClasses("D", "dorian");
      expect(result).toEqual(new Set<PitchClass>([11]));
    });

    it("Eフリジアンの特性音はF（ピッチクラス5）", () => {
      // E=4, m2は1半音上 → 4+1=5 → F
      const result = getCharacteristicPitchClasses("E", "phrygian");
      expect(result).toEqual(new Set<PitchClass>([5]));
    });

    it("Fリディアンの特性音はB（ピッチクラス11）", () => {
      // F=5, #4は6半音上 → 5+6=11 → B
      const result = getCharacteristicPitchClasses("F", "lydian");
      expect(result).toEqual(new Set<PitchClass>([11]));
    });

    it("Gミクソリディアンの特性音はF（ピッチクラス5）", () => {
      // G=7, b7は10半音上 → 7+10=17%12=5 → F
      const result = getCharacteristicPitchClasses("G", "mixolydian");
      expect(result).toEqual(new Set<PitchClass>([5]));
    });

    it("Aエオリアンの特性音はF（ピッチクラス5）", () => {
      // A=9, b6は8半音上 → 9+8=17%12=5 → F
      const result = getCharacteristicPitchClasses("A", "aeolian");
      expect(result).toEqual(new Set<PitchClass>([5]));
    });

    it("Bロクリアンの特性音はF（ピッチクラス5）", () => {
      // B=11, b5は6半音上 → 11+6=17%12=5 → F
      const result = getCharacteristicPitchClasses("B", "locrian");
      expect(result).toEqual(new Set<PitchClass>([5]));
    });

    it("Cハーモニックマイナーの特性音はB（ピッチクラス11）", () => {
      // C=0, M7は11半音上 → 0+11=11 → B
      const result = getCharacteristicPitchClasses("C", "harmonic-minor");
      expect(result).toEqual(new Set<PitchClass>([11]));
    });

    it("Cメロディックマイナーの特性音はA（9）とB（11）", () => {
      const result = getCharacteristicPitchClasses("C", "melodic-minor");
      expect(result).toEqual(new Set<PitchClass>([9, 11]));
    });

    it("異なるルートでもピッチクラスが正しく転調される", () => {
      // Abリディアンの特性音は #4 = Ab(8)+6=14%12=2 → D
      const result = getCharacteristicPitchClasses("Ab", "lydian");
      expect(result).toEqual(new Set<PitchClass>([2]));
    });

    it("返り値はSetである", () => {
      const result = getCharacteristicPitchClasses("C", "major");
      expect(result).toBeInstanceOf(Set);
    });
  });
});
