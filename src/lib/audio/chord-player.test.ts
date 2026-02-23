import { describe, expect, it } from "vitest";
import {
  chordToToneNotes,
  DEFAULT_CHORD_DURATION_SEC,
  noteNameToToneNotation,
} from "./chord-player";

describe("noteNameToToneNotation", () => {
  it("C を C4 に変換する", () => {
    expect(noteNameToToneNotation("C")).toBe("C4");
  });

  it("D を D4 に変換する", () => {
    expect(noteNameToToneNotation("D")).toBe("D4");
  });

  it("シャープ付きノート C# を C#4 に変換する", () => {
    expect(noteNameToToneNotation("C#")).toBe("C#4");
  });

  it("フラット付きノート Bb を Bb4 に変換する", () => {
    expect(noteNameToToneNotation("Bb")).toBe("Bb4");
  });

  it("オクターブを指定できる", () => {
    expect(noteNameToToneNotation("C", 3)).toBe("C3");
    expect(noteNameToToneNotation("G", 5)).toBe("G5");
  });

  it("低い音（C より下）は次のオクターブにならない", () => {
    expect(noteNameToToneNotation("B", 3)).toBe("B3");
  });
});

describe("chordToToneNotes", () => {
  it("C major トライアドを C4, E4, G4 に変換する", () => {
    const notes = chordToToneNotes("C", "major");
    expect(notes).toEqual(["C4", "E4", "G4"]);
  });

  it("C minor トライアドを C4, Eb4, G4 に変換する", () => {
    const notes = chordToToneNotes("C", "minor");
    expect(notes).toEqual(["C4", "D#4", "G4"]);
  });

  it("C dominant7 を C4, E4, G4, Bb4 に変換する", () => {
    const notes = chordToToneNotes("C", "dominant7");
    expect(notes).toEqual(["C4", "E4", "G4", "A#4"]);
  });

  it("G major トライアドを G3, B3, D4 に変換する（ギターの中域）", () => {
    const notes = chordToToneNotes("G", "major", 3);
    expect(notes).toEqual(["G3", "B3", "D4"]);
  });

  it("ルートより低いピッチクラスのノートは次のオクターブになる", () => {
    // A major: A, C#, E - A=9, C#=1, E=4 → C# と E はルートより低いピッチクラス
    const notes = chordToToneNotes("A", "major");
    expect(notes).toEqual(["A4", "C#5", "E5"]);
  });

  it("diminished コードを正しく変換する", () => {
    const notes = chordToToneNotes("B", "diminished");
    expect(notes).toEqual(["B4", "D5", "F5"]);
  });

  it("minor7b5 コードを正しく変換する", () => {
    const notes = chordToToneNotes("B", "minor7b5");
    expect(notes).toEqual(["B4", "D5", "F5", "A5"]);
  });
});

describe("DEFAULT_CHORD_DURATION_SEC", () => {
  it("デフォルトのコード再生時間が正の数である", () => {
    expect(DEFAULT_CHORD_DURATION_SEC).toBeGreaterThan(0);
  });

  it("デフォルトのコード再生時間が妥当な範囲（0.3〜3秒）である", () => {
    expect(DEFAULT_CHORD_DURATION_SEC).toBeGreaterThanOrEqual(0.3);
    expect(DEFAULT_CHORD_DURATION_SEC).toBeLessThanOrEqual(3);
  });
});
