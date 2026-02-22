import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DiatonicChordInfo } from "@/lib/music-theory";
import { createChord } from "@/lib/music-theory";
import { DiatonicChordCard } from "./diatonic-chord-card";

function createTestChordInfo(overrides: Partial<DiatonicChordInfo> = {}): DiatonicChordInfo {
  return {
    degree: 1,
    romanNumeral: "I",
    chord: createChord("C", "major"),
    chordFunction: "tonic",
    ...overrides,
  };
}

describe("DiatonicChordCard", () => {
  describe("レンダリング", () => {
    it("ローマ数字が表示される", () => {
      const chordInfo = createTestChordInfo({ romanNumeral: "IV" });

      render(<DiatonicChordCard chordInfo={chordInfo} />);

      expect(screen.getByText("IV")).toBeInTheDocument();
    });

    it("コードシンボルが表示される", () => {
      const chordInfo = createTestChordInfo({
        chord: createChord("D", "minor"),
        romanNumeral: "ii",
      });

      render(<DiatonicChordCard chordInfo={chordInfo} />);

      expect(screen.getByText("Dm")).toBeInTheDocument();
    });

    it("コード構成音が表示される", () => {
      const chordInfo = createTestChordInfo({
        chord: createChord("C", "major"),
      });

      render(<DiatonicChordCard chordInfo={chordInfo} />);

      expect(screen.getByText("C - E - G")).toBeInTheDocument();
    });

    it("コード機能がバッジで表示される", () => {
      const chordInfo = createTestChordInfo({ chordFunction: "tonic" });

      render(<DiatonicChordCard chordInfo={chordInfo} />);

      expect(screen.getByText("T")).toBeInTheDocument();
    });

    it("サブドミナント機能のバッジが表示される", () => {
      const chordInfo = createTestChordInfo({
        degree: 2,
        romanNumeral: "ii",
        chord: createChord("D", "minor"),
        chordFunction: "subdominant",
      });

      render(<DiatonicChordCard chordInfo={chordInfo} />);

      expect(screen.getByText("SD")).toBeInTheDocument();
    });

    it("ドミナント機能のバッジが表示される", () => {
      const chordInfo = createTestChordInfo({
        degree: 5,
        romanNumeral: "V",
        chord: createChord("G", "major"),
        chordFunction: "dominant",
      });

      render(<DiatonicChordCard chordInfo={chordInfo} />);

      expect(screen.getByText("D")).toBeInTheDocument();
    });
  });

  describe("セブンスコード", () => {
    it("セブンスコードのシンボルが表示される", () => {
      const chordInfo = createTestChordInfo({
        chord: createChord("C", "major7"),
        romanNumeral: "IM7",
      });

      render(<DiatonicChordCard chordInfo={chordInfo} />);

      expect(screen.getByText("CM7")).toBeInTheDocument();
    });

    it("セブンスコードの構成音が4音表示される", () => {
      const chordInfo = createTestChordInfo({
        chord: createChord("C", "major7"),
        romanNumeral: "IM7",
      });

      render(<DiatonicChordCard chordInfo={chordInfo} />);

      expect(screen.getByText("C - E - G - B")).toBeInTheDocument();
    });
  });

  describe("dimmed 表示", () => {
    it("dimmed=true のカードは opacity-40 で表示される", () => {
      const chordInfo = createTestChordInfo();

      const { container } = render(<DiatonicChordCard chordInfo={chordInfo} dimmed />);

      const card = container.firstElementChild as HTMLElement;
      expect(card.className).toContain("opacity-40");
    });

    it("dimmed が指定されない場合は opacity-40 が適用されない", () => {
      const chordInfo = createTestChordInfo();

      const { container } = render(<DiatonicChordCard chordInfo={chordInfo} />);

      const card = container.firstElementChild as HTMLElement;
      expect(card.className).not.toContain("opacity-40");
    });
  });

  describe("compact 表示", () => {
    it("compact=true のとき構成音が表示されない", () => {
      const chordInfo = createTestChordInfo({
        chord: createChord("C", "major"),
      });

      render(<DiatonicChordCard chordInfo={chordInfo} compact />);

      expect(screen.queryByText("C - E - G")).not.toBeInTheDocument();
    });

    it("compact が指定されないとき構成音が表示される", () => {
      const chordInfo = createTestChordInfo({
        chord: createChord("C", "major"),
      });

      render(<DiatonicChordCard chordInfo={chordInfo} />);

      expect(screen.getByText("C - E - G")).toBeInTheDocument();
    });

    it("compact=true のとき gap-1 クラスが適用される", () => {
      const chordInfo = createTestChordInfo();

      const { container } = render(<DiatonicChordCard chordInfo={chordInfo} compact />);

      const card = container.firstElementChild as HTMLElement;
      expect(card.className).toContain("gap-1");
      expect(card.className).not.toContain("gap-2");
    });
  });

  describe("スタイリング", () => {
    it("カードが正方形（aspect-square）である", () => {
      const chordInfo = createTestChordInfo();

      const { container } = render(<DiatonicChordCard chordInfo={chordInfo} />);

      const card = container.firstElementChild as HTMLElement;
      expect(card.className).toContain("aspect-square");
    });

    it("トニック機能のカードにトニックの色が適用される", () => {
      const chordInfo = createTestChordInfo({ chordFunction: "tonic" });

      const { container } = render(<DiatonicChordCard chordInfo={chordInfo} />);

      const card = container.firstElementChild as HTMLElement;
      expect(card.className).toContain("bg-tonic-subtle");
    });

    it("サブドミナント機能のカードにサブドミナントの色が適用される", () => {
      const chordInfo = createTestChordInfo({
        degree: 4,
        romanNumeral: "IV",
        chord: createChord("F", "major"),
        chordFunction: "subdominant",
      });

      const { container } = render(<DiatonicChordCard chordInfo={chordInfo} />);

      const card = container.firstElementChild as HTMLElement;
      expect(card.className).toContain("bg-subdominant-subtle");
    });

    it("ドミナント機能のカードにドミナントの色が適用される", () => {
      const chordInfo = createTestChordInfo({
        degree: 5,
        romanNumeral: "V",
        chord: createChord("G", "major"),
        chordFunction: "dominant",
      });

      const { container } = render(<DiatonicChordCard chordInfo={chordInfo} />);

      const card = container.firstElementChild as HTMLElement;
      expect(card.className).toContain("bg-dominant-subtle");
    });
  });
});
