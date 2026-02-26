import type { NoteRole, OverlayPosition, PitchClass } from "@/lib/music-theory";

export type KeyboardNoteInfo = {
  readonly pitchClass: PitchClass;
  readonly noteName: string;
  readonly role: NoteRole;
  readonly isCharacteristic: boolean;
  readonly isAvoid: boolean;
};

const ROLE_PRIORITY: Record<NoteRole, number> = {
  "chord-root": 0,
  "chord-tone": 1,
  scale: 2,
};

/**
 * フレットボードのオーバーレイポジションからピッチクラスごとのノート情報を導出する。
 * 同じピッチクラスに複数のロールがある場合、最も優先度が高いロールを採用する。
 */
export function deriveKeyboardNotes(
  positions: readonly OverlayPosition[]
): Map<PitchClass, KeyboardNoteInfo> {
  const noteMap = new Map<PitchClass, KeyboardNoteInfo>();

  for (const pos of positions) {
    const existing = noteMap.get(pos.note.pitchClass);
    if (!existing || ROLE_PRIORITY[pos.role] < ROLE_PRIORITY[existing.role]) {
      noteMap.set(pos.note.pitchClass, {
        pitchClass: pos.note.pitchClass,
        noteName: pos.note.name,
        role: pos.role,
        isCharacteristic: pos.isCharacteristic,
        isAvoid: pos.isAvoid,
      });
    }
  }

  return noteMap;
}
