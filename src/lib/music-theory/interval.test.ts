import {
  applyInterval,
  createInterval,
  INTERVALS,
  intervalBetween,
  invertInterval,
} from "./interval";
import { createNote } from "./note";

describe("interval", () => {
  describe("INTERVALS", () => {
    it("P1（完全1度）は0半音", () => {
      expect(INTERVALS.P1.semitones).toBe(0);
    });

    it("m2（短2度）は1半音", () => {
      expect(INTERVALS.m2.semitones).toBe(1);
    });

    it("M2（長2度）は2半音", () => {
      expect(INTERVALS.M2.semitones).toBe(2);
    });

    it("m3（短3度）は3半音", () => {
      expect(INTERVALS.m3.semitones).toBe(3);
    });

    it("M3（長3度）は4半音", () => {
      expect(INTERVALS.M3.semitones).toBe(4);
    });

    it("P4（完全4度）は5半音", () => {
      expect(INTERVALS.P4.semitones).toBe(5);
    });

    it("A4/d5（増4度/減5度）は6半音", () => {
      expect(INTERVALS.A4.semitones).toBe(6);
      expect(INTERVALS.d5.semitones).toBe(6);
    });

    it("P5（完全5度）は7半音", () => {
      expect(INTERVALS.P5.semitones).toBe(7);
    });

    it("m6（短6度）は8半音", () => {
      expect(INTERVALS.m6.semitones).toBe(8);
    });

    it("M6（長6度）は9半音", () => {
      expect(INTERVALS.M6.semitones).toBe(9);
    });

    it("m7（短7度）は10半音", () => {
      expect(INTERVALS.m7.semitones).toBe(10);
    });

    it("M7（長7度）は11半音", () => {
      expect(INTERVALS.M7.semitones).toBe(11);
    });

    it("P8（完全8度）は12半音", () => {
      expect(INTERVALS.P8.semitones).toBe(12);
    });

    it("各音程がquality, degree, nameを持つ", () => {
      expect(INTERVALS.M3).toEqual({
        semitones: 4,
        quality: "major",
        degree: 3,
        name: "M3",
      });
    });
  });

  describe("createInterval", () => {
    it("半音数から音程を生成する", () => {
      const interval = createInterval(7);
      expect(interval.semitones).toBe(7);
      expect(interval.name).toBe("P5");
    });

    it("0半音はP1", () => {
      expect(createInterval(0).name).toBe("P1");
    });

    it("12半音はP8", () => {
      expect(createInterval(12).name).toBe("P8");
    });

    it("6半音はA4（デフォルト）", () => {
      expect(createInterval(6).name).toBe("A4");
    });
  });

  describe("intervalBetween", () => {
    it("CからGはP5（7半音）", () => {
      const interval = intervalBetween(createNote("C"), createNote("G"));
      expect(interval.semitones).toBe(7);
    });

    it("CからEはM3（4半音）", () => {
      const interval = intervalBetween(createNote("C"), createNote("E"));
      expect(interval.semitones).toBe(4);
    });

    it("同じ音はP1（0半音）", () => {
      const interval = intervalBetween(createNote("A"), createNote("A"));
      expect(interval.semitones).toBe(0);
    });

    it("GからCはP4（5半音）（上向き計算）", () => {
      const interval = intervalBetween(createNote("G"), createNote("C"));
      expect(interval.semitones).toBe(5);
    });

    it("BからCはm2（1半音）", () => {
      const interval = intervalBetween(createNote("B"), createNote("C"));
      expect(interval.semitones).toBe(1);
    });
  });

  describe("applyInterval", () => {
    it("CにP5を適用するとG", () => {
      const result = applyInterval(createNote("C"), INTERVALS.P5);
      expect(result.pitchClass).toBe(7);
    });

    it("CにM3を適用するとE", () => {
      const result = applyInterval(createNote("C"), INTERVALS.M3);
      expect(result.pitchClass).toBe(4);
    });

    it("AにM3を適用するとC#", () => {
      const result = applyInterval(createNote("A"), INTERVALS.M3);
      expect(result.pitchClass).toBe(1);
    });

    it("preferFlat指定でフラット表記", () => {
      const result = applyInterval(createNote("A"), INTERVALS.M3, true);
      expect(result.name).toBe("Db");
    });

    it("P8を適用すると同じピッチクラス", () => {
      const result = applyInterval(createNote("D"), INTERVALS.P8);
      expect(result.pitchClass).toBe(2);
    });
  });

  describe("invertInterval", () => {
    it("P5の転回はP4", () => {
      const inverted = invertInterval(INTERVALS.P5);
      expect(inverted.semitones).toBe(5);
    });

    it("M3の転回はm6", () => {
      const inverted = invertInterval(INTERVALS.M3);
      expect(inverted.semitones).toBe(8);
    });

    it("P1の転回はP8", () => {
      const inverted = invertInterval(INTERVALS.P1);
      expect(inverted.semitones).toBe(12);
    });

    it("P8の転回はP1", () => {
      const inverted = invertInterval(INTERVALS.P8);
      expect(inverted.semitones).toBe(0);
    });

    it("m2の転回はM7", () => {
      const inverted = invertInterval(INTERVALS.m2);
      expect(inverted.semitones).toBe(11);
    });

    it("M7の転回はm2", () => {
      const inverted = invertInterval(INTERVALS.M7);
      expect(inverted.semitones).toBe(1);
    });
  });
});
