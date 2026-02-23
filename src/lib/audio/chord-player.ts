import {
  CHORD_INTERVAL_PATTERNS,
  type ChordQuality,
  createNote,
  transposeNote,
} from "@/lib/music-theory";

/**
 * 音楽理論のノート名を Tone.js が理解できるオクターブ付き表記に変換する
 */
export function noteNameToToneNotation(name: string, octave = 4): string {
  return `${name}${octave}`;
}

/**
 * ルートとクオリティからコード構成音を Tone.js 表記の配列として返す
 * ルートより低いピッチクラスの音は次のオクターブに配置する（ボイシングの自然な並び）
 */
export function chordToToneNotes(rootName: string, quality: ChordQuality, octave = 4): string[] {
  const root = createNote(rootName);
  const pattern = CHORD_INTERVAL_PATTERNS[quality];

  return pattern.map((semitones) => {
    const note = semitones === 0 ? root : transposeNote(root, semitones);
    const pitchClass = note.pitchClass as number;
    const rootPitchClass = root.pitchClass as number;

    // ルートより低いピッチクラスの場合は次のオクターブ
    const noteOctave = pitchClass < rootPitchClass ? octave + 1 : octave;
    return noteNameToToneNotation(note.name, noteOctave);
  });
}

/**
 * Tone.js の PolySynth を使ってコードを再生する
 * ブラウザのオーディオコンテキスト制約に対応するため、
 * Tone.start() を呼んでから再生する
 */
export async function playChord(
  rootName: string,
  quality: ChordQuality,
  options: { duration?: string; octave?: number } = {}
): Promise<void> {
  const { duration = "2n", octave = 4 } = options;
  const Tone = await import("tone");

  await Tone.start();

  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.4,
      release: 1.0,
    },
    volume: -8,
  }).toDestination();

  const notes = chordToToneNotes(rootName, quality, octave);
  synth.triggerAttackRelease(notes, duration);

  // シンセを自動解放する
  const durationSec = Tone.Time(duration).toSeconds();
  setTimeout(
    () => {
      synth.dispose();
    },
    (durationSec + 1.5) * 1000
  );
}
