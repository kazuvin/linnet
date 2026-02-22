import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  _resetKeyStoreForTesting,
  setChordType,
  setRootName,
} from "@/features/key-selection/stores/key-store";
import { DiatonicChordList } from "./diatonic-chord-list";

describe("DiatonicChordList", () => {
  afterEach(() => {
    _resetKeyStoreForTesting();
  });

  describe("レンダリング", () => {
    it("セクション見出しが表示される", () => {
      render(<DiatonicChordList />);

      expect(screen.getByRole("heading", { name: "Diatonic Chords" })).toBeInTheDocument();
    });

    it("7つのダイアトニックコードカードが表示される", () => {
      render(<DiatonicChordList />);

      const cards = screen.getAllByRole("listitem");
      expect(cards).toHaveLength(7);
    });

    it("Key=C のトライアドが正しく表示される", () => {
      render(<DiatonicChordList />);

      expect(screen.getByText("C")).toBeInTheDocument();
      expect(screen.getByText("Dm")).toBeInTheDocument();
      expect(screen.getByText("Em")).toBeInTheDocument();
      expect(screen.getByText("F")).toBeInTheDocument();
      expect(screen.getByText("G")).toBeInTheDocument();
      expect(screen.getByText("Am")).toBeInTheDocument();
      expect(screen.getByText("Bdim")).toBeInTheDocument();
    });

    it("ローマ数字が全て表示される", () => {
      render(<DiatonicChordList />);

      expect(screen.getByText("I")).toBeInTheDocument();
      expect(screen.getByText("ii")).toBeInTheDocument();
      expect(screen.getByText("iii")).toBeInTheDocument();
      expect(screen.getByText("IV")).toBeInTheDocument();
      expect(screen.getByText("V")).toBeInTheDocument();
      expect(screen.getByText("vi")).toBeInTheDocument();
    });
  });

  describe("キー変更への反応", () => {
    it("キーが G に変更されるとコードが更新される", async () => {
      render(<DiatonicChordList />);

      await act(async () => {
        setRootName("G");
      });

      // コードシンボルを確認（"D" はドミナントバッジと重複するため getAllByText で確認）
      expect(screen.getByText("Am")).toBeInTheDocument();
      expect(screen.getByText("Bm")).toBeInTheDocument();
      expect(screen.getAllByText("D").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Em")).toBeInTheDocument();
      expect(screen.getByText("F#dim")).toBeInTheDocument();
    });

    it("セブンスに変更するとセブンスコードが表示される", async () => {
      render(<DiatonicChordList />);

      await act(async () => {
        setChordType("seventh");
      });

      expect(screen.getByText("CM7")).toBeInTheDocument();
      expect(screen.getByText("Dm7")).toBeInTheDocument();
      expect(screen.getByText("Em7")).toBeInTheDocument();
      expect(screen.getByText("FM7")).toBeInTheDocument();
      expect(screen.getByText("G7")).toBeInTheDocument();
      expect(screen.getByText("Am7")).toBeInTheDocument();
      expect(screen.getByText("Bm7(b5)")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("list ロールを持つ", () => {
      render(<DiatonicChordList />);

      expect(screen.getByRole("list")).toBeInTheDocument();
    });
  });
});
