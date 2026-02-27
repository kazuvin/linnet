import {
  CHORD_INTERVAL_PATTERNS,
  type ChordQuality,
  createNote,
  transposeNote,
} from "@/lib/music-theory";

/** デフォルトのコード再生時間（秒） */
export const DEFAULT_CHORD_DURATION_SEC = 0.8;

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

// --- グローバルシングルトン synth ---
type ToneModule = typeof import("tone");
let toneModule: ToneModule | null = null;
let globalSynth: InstanceType<ToneModule["PolySynth"]> | null = null;
let releaseTimer: ReturnType<typeof setTimeout> | null = null;

async function getTone(): Promise<ToneModule> {
  if (!toneModule) {
    toneModule = await import("tone");
  }
  return toneModule;
}

function getOrCreateSynth(Tone: ToneModule): InstanceType<ToneModule["PolySynth"]> {
  if (!globalSynth) {
    globalSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.02,
        decay: 0.3,
        sustain: 0.4,
        release: 0.3,
      },
      volume: -8,
    }).toDestination();
  }
  return globalSynth;
}

/**
 * 現在再生中の音をすべて停止する
 */
export async function stopAllSound(): Promise<void> {
  if (releaseTimer) {
    clearTimeout(releaseTimer);
    releaseTimer = null;
  }
  if (globalSynth) {
    globalSynth.releaseAll();
  }
}

/**
 * グローバルシングルトンの PolySynth を使ってコードを再生する
 * - 前回再生中の音は即座に停止される（アプリ全体で同時に鳴るのは1コードだけ）
 * - 返却される Promise は再生時間（durationSec）経過後に resolve する
 */
export async function playChord(
  rootName: string,
  quality: ChordQuality,
  options: { durationSec?: number; octave?: number } = {}
): Promise<void> {
  const { durationSec = DEFAULT_CHORD_DURATION_SEC, octave = 4 } = options;
  const Tone = await getTone();

  await Tone.start();

  const synth = getOrCreateSynth(Tone);

  // 前回の音を即座に停止
  synth.releaseAll();
  if (releaseTimer) {
    clearTimeout(releaseTimer);
    releaseTimer = null;
  }

  const notes = chordToToneNotes(rootName, quality, octave);
  synth.triggerAttackRelease(notes, durationSec);

  // durationSec 後に resolve（次のコードの再生タイミングと揃う）
  return new Promise((resolve) => {
    releaseTimer = setTimeout(() => {
      releaseTimer = null;
      resolve();
    }, durationSec * 1000);
  });
}

/**
 * コードを持続的に鳴らす（triggerAttack のみ）。
 * 次に startSustainChord / stopAllSound が呼ばれるまで音が鳴り続ける。
 * グリッド再生時の「-」セルでの持続再生に使用する。
 */
export async function startSustainChord(
  rootName: string,
  quality: ChordQuality,
  octave = 4
): Promise<void> {
  const Tone = await getTone();
  await Tone.start();

  const synth = getOrCreateSynth(Tone);

  // 前回の音を即座に停止
  synth.releaseAll();
  if (releaseTimer) {
    clearTimeout(releaseTimer);
    releaseTimer = null;
  }

  const notes = chordToToneNotes(rootName, quality, octave);
  synth.triggerAttack(notes);
}
