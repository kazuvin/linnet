import { describe, expect, it } from "vitest";
import { DEFAULT_SCALE_NOTE_DURATION_SEC, scaleToToneNotes } from "./scale-player";

describe("scaleToToneNotes", () => {
  it("C メジャースケールを C4〜C5 の昇順で返す", () => {
    const notes = scaleToToneNotes("C", "major");
    expect(notes).toEqual(["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"]);
  });

  it("A ナチュラルマイナースケールを A4〜A5 の昇順で返す", () => {
    const notes = scaleToToneNotes("A", "natural-minor");
    expect(notes).toEqual(["A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5"]);
  });

  it("G ミクソリディアンスケールを G4〜G5 の昇順で返す", () => {
    const notes = scaleToToneNotes("G", "mixolydian");
    expect(notes).toEqual(["G4", "A4", "B4", "C5", "D5", "E5", "F5", "G5"]);
  });

  it("オクターブを指定できる", () => {
    const notes = scaleToToneNotes("C", "major", 3);
    expect(notes).toEqual(["C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4"]);
  });

  it("Bb ドリアンスケールでフラット表記が正しい", () => {
    const notes = scaleToToneNotes("Bb", "dorian");
    expect(notes).toEqual(["Bb4", "C5", "Db5", "Eb5", "F5", "G5", "Ab5", "Bb5"]);
  });

  it("半音階的スケール（half-whole-diminished）で8音+オクターブを返す", () => {
    const notes = scaleToToneNotes("C", "half-whole-diminished");
    // パターン: [0, 1, 3, 4, 6, 7, 9, 10] → 8音 + オクターブ = 9音
    expect(notes).toHaveLength(9);
    expect(notes[0]).toBe("C4");
    expect(notes[notes.length - 1]).toBe("C5");
  });

  it("最後の音は常にルートの1オクターブ上", () => {
    const notes = scaleToToneNotes("F#", "major");
    expect(notes[notes.length - 1]).toBe("F#5");
  });
});

describe("DEFAULT_SCALE_NOTE_DURATION_SEC", () => {
  it("デフォルトのノート再生時間が正の数である", () => {
    expect(DEFAULT_SCALE_NOTE_DURATION_SEC).toBeGreaterThan(0);
  });

  it("デフォルトのノート再生時間が妥当な範囲（0.1〜1秒）である", () => {
    expect(DEFAULT_SCALE_NOTE_DURATION_SEC).toBeGreaterThanOrEqual(0.1);
    expect(DEFAULT_SCALE_NOTE_DURATION_SEC).toBeLessThanOrEqual(1);
  });
});
