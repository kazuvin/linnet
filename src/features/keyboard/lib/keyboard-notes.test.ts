import { describe, expect, it } from "vitest";
import type { OverlayPosition } from "@/lib/music-theory";
import { deriveKeyboardNotes } from "./keyboard-notes";

function pos(
  pitchClass: number,
  name: string,
  role: "chord-root" | "chord-tone" | "scale",
  opts: { isCharacteristic?: boolean; isAvoid?: boolean } = {}
): OverlayPosition {
  return {
    string: 1,
    fret: 0,
    note: { pitchClass: pitchClass as 0, name },
    role,
    isCharacteristic: opts.isCharacteristic ?? false,
    isAvoid: opts.isAvoid ?? false,
  };
}

describe("deriveKeyboardNotes", () => {
  it("空のポジション配列から空のMapを返す", () => {
    const result = deriveKeyboardNotes([]);
    expect(result.size).toBe(0);
  });

  it("各pitchClassについて1つのエントリを返す", () => {
    const positions: OverlayPosition[] = [
      pos(0, "C", "chord-root"),
      pos(4, "E", "chord-tone"),
      pos(7, "G", "chord-tone"),
    ];
    const result = deriveKeyboardNotes(positions);
    expect(result.size).toBe(3);
    expect(result.get(0 as 0)?.role).toBe("chord-root");
    expect(result.get(4 as 4)?.role).toBe("chord-tone");
    expect(result.get(7 as 7)?.role).toBe("chord-tone");
  });

  it("同じpitchClassの重複はロール優先度が高い方を残す（chord-root > chord-tone > scale）", () => {
    const positions: OverlayPosition[] = [
      // 同じC音が複数弦に存在
      pos(0, "C", "scale"),
      pos(0, "C", "chord-root"),
      pos(0, "C", "chord-tone"),
    ];
    const result = deriveKeyboardNotes(positions);
    expect(result.size).toBe(1);
    expect(result.get(0 as 0)?.role).toBe("chord-root");
  });

  it("chord-tone は scale より優先される", () => {
    const positions: OverlayPosition[] = [pos(4, "E", "scale"), pos(4, "E", "chord-tone")];
    const result = deriveKeyboardNotes(positions);
    expect(result.get(4 as 4)?.role).toBe("chord-tone");
  });

  it("最優先ロールのエントリからisCharacteristic/isAvoidフラグを保持する", () => {
    const positions: OverlayPosition[] = [
      pos(4, "E", "chord-tone", { isCharacteristic: true }),
      pos(4, "E", "scale", { isCharacteristic: false }),
    ];
    const result = deriveKeyboardNotes(positions);
    expect(result.get(4 as 4)?.isCharacteristic).toBe(true);
  });

  it("isAvoidフラグも正しく保持される", () => {
    const positions: OverlayPosition[] = [pos(5, "F", "scale", { isAvoid: true })];
    const result = deriveKeyboardNotes(positions);
    expect(result.get(5 as 5)?.isAvoid).toBe(true);
  });

  it("noteNameを正しく保持する", () => {
    const positions: OverlayPosition[] = [pos(1, "Db", "scale")];
    const result = deriveKeyboardNotes(positions);
    expect(result.get(1 as 1)?.noteName).toBe("Db");
  });
});
