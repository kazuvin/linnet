import { createScale, type ScaleType } from "@/lib/music-theory";
import { noteNameToToneNotation } from "./chord-player";

/** デフォルトのスケール1音あたりの再生時間（秒） */
export const DEFAULT_SCALE_NOTE_DURATION_SEC = 0.3;

/**
 * ルートとスケールタイプからスケール構成音を Tone.js 表記の昇順配列として返す
 * 最後にルートの1オクターブ上を追加して完結させる
 */
export function scaleToToneNotes(rootName: string, scaleType: ScaleType, octave = 4): string[] {
  const scale = createScale(rootName, scaleType);
  const rootPitchClass = scale.root.pitchClass;

  const notes = scale.notes.map((note) => {
    const noteOctave = note.pitchClass < rootPitchClass ? octave + 1 : octave;
    return noteNameToToneNotation(note.name, noteOctave);
  });

  // ルートの1オクターブ上で完結
  notes.push(noteNameToToneNotation(scale.root.name, octave + 1));

  return notes;
}

// --- スケール再生用シンセ ---
type ToneModule = typeof import("tone");
let toneModule: ToneModule | null = null;
let scaleSynth: InstanceType<ToneModule["Synth"]> | null = null;
let scaleTimers: ReturnType<typeof setTimeout>[] = [];
let isScalePlaying = false;

async function getTone(): Promise<ToneModule> {
  if (!toneModule) {
    toneModule = await import("tone");
  }
  return toneModule;
}

function getOrCreateScaleSynth(Tone: ToneModule): InstanceType<ToneModule["Synth"]> {
  if (!scaleSynth) {
    scaleSynth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 0.2,
      },
      volume: -8,
    }).toDestination();
  }
  return scaleSynth;
}

/**
 * スケールの音を昇順に1音ずつ再生する
 * - 前回再生中のスケールは即座に停止される
 * - 返却される Promise は全音再生後に resolve する
 */
export async function playScale(
  rootName: string,
  scaleType: ScaleType,
  options: { noteDurationSec?: number; octave?: number } = {}
): Promise<void> {
  const { noteDurationSec = DEFAULT_SCALE_NOTE_DURATION_SEC, octave = 4 } = options;

  // 前回の再生を停止
  stopScale();

  const Tone = await getTone();
  await Tone.start();

  const synth = getOrCreateScaleSynth(Tone);
  const notes = scaleToToneNotes(rootName, scaleType, octave);

  isScalePlaying = true;

  return new Promise<void>((resolve) => {
    for (let i = 0; i < notes.length; i++) {
      const timer = setTimeout(
        () => {
          if (!isScalePlaying) return;
          synth.triggerAttackRelease(notes[i], noteDurationSec * 0.9);
        },
        i * noteDurationSec * 1000
      );
      scaleTimers.push(timer);
    }

    // 全音再生後に resolve
    const endTimer = setTimeout(
      () => {
        isScalePlaying = false;
        scaleTimers = [];
        resolve();
      },
      notes.length * noteDurationSec * 1000
    );
    scaleTimers.push(endTimer);
  });
}

/**
 * スケール再生を停止する
 */
export function stopScale(): void {
  isScalePlaying = false;
  for (const timer of scaleTimers) {
    clearTimeout(timer);
  }
  scaleTimers = [];
  if (scaleSynth) {
    scaleSynth.triggerRelease();
  }
}
