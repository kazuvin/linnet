import { findAvailableScalesForChord } from "./available-scales";

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
    it("I度のCM7はIonian, Lydian, Mixolydianで使える", () => {
      const scales = findAvailableScalesForChord("C", 1, "C", "major7");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("major");
      expect(scaleTypes).toContain("lydian");
      expect(scaleTypes).toContain("mixolydian");
    });

    it("V度のG7（dominant7）はIonianのみ", () => {
      // Ionianの V7 = G dominant7
      // 他のモードの extendToSeventh では dominant7 は生成されない
      const scales = findAvailableScalesForChord("C", 5, "G", "dominant7");
      const scaleTypes = scales.map((s) => s.scaleType);
      expect(scaleTypes).toContain("major");
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

  describe("結果が空になるケース", () => {
    it("不正な度数を指定した場合は空配列を返す", () => {
      const scales = findAvailableScalesForChord("C", 0, "C", "major");
      expect(scales).toEqual([]);
    });
  });
});
