"use client";

import { useCallback, useEffect, useRef } from "react";
import { useChordPlaybackStore } from "@/features/chord-playback/stores/chord-playback-store";
import { useChordProgressionStore } from "@/features/chord-progression/stores/chord-progression-store";
import { playChord, stopAllSound } from "@/lib/audio/chord-player";
import type { GridChord } from "../stores/chord-grid-store";
import { GRID_SIZE, useChordGridStore } from "../stores/chord-grid-store";

/**
 * グリッドのループ再生を管理するフック。
 * BPM に基づいて 16 分音符ごとにステップを進め、
 * コードが配置されたセルでは音を鳴らし、フレットボードのスケール表示を更新する。
 */
export function useGridPlayback() {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastChordRef = useRef<GridChord | null>(null);

  const stopPlayback = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    useChordGridStore.getState().stop();
    useChordProgressionStore.getState().setActiveChordOverride(null);
    lastChordRef.current = null;
    await stopAllSound();
  }, []);

  const startPlayback = useCallback(async () => {
    await stopPlayback();

    const gridState = useChordGridStore.getState();
    const hasChords = gridState.cells.some((c) => c !== null);
    if (!hasChords) return;

    useChordGridStore.getState().setPlaying(true);
    useChordGridStore.getState().setCurrentStep(0);

    // 最初のステップを即座に処理
    const chord = gridState.getChordAtStep(0);
    if (chord) {
      lastChordRef.current = chord;
      useChordProgressionStore.getState().setActiveChordOverride({
        id: `grid-${chord.rootName}-${chord.quality}`,
        ...chord,
      });
      if (!useChordPlaybackStore.getState().isMuted) {
        playChord(chord.rootName, chord.quality, { durationSec: 0.3 });
      }
    }

    const intervalMs = (60 * 1000) / gridState.bpm / 4;
    let step = 0;

    timerRef.current = setInterval(() => {
      step = (step + 1) % GRID_SIZE;
      const state = useChordGridStore.getState();

      if (!state.isPlaying) {
        stopPlayback();
        return;
      }

      useChordGridStore.getState().setCurrentStep(step);
      const currentChord = state.getChordAtStep(step);

      if (currentChord) {
        // 新しいコードセル（null でないセル）に到達したら音を鳴らす
        const cellChord = state.cells[step];
        if (cellChord !== null && !useChordPlaybackStore.getState().isMuted) {
          playChord(cellChord.rootName, cellChord.quality, { durationSec: 0.3 });
        }

        // フレットボードのスケール表示を更新
        if (
          !lastChordRef.current ||
          currentChord.rootName !== lastChordRef.current.rootName ||
          currentChord.quality !== lastChordRef.current.quality
        ) {
          useChordProgressionStore.getState().setActiveChordOverride({
            id: `grid-${currentChord.rootName}-${currentChord.quality}`,
            ...currentChord,
          });
          lastChordRef.current = currentChord;
        }
      }
    }, intervalMs);
  }, [stopPlayback]);

  // コンポーネントのアンマウント時にクリーンアップ
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      useChordProgressionStore.getState().setActiveChordOverride(null);
    };
  }, []);

  // BPM 変更時に再生中なら再起動
  useEffect(() => {
    return useChordGridStore.subscribe((state, prev) => {
      if (state.bpm !== prev.bpm && state.isPlaying && timerRef.current) {
        startPlayback();
      }
    });
  }, [startPlayback]);

  const togglePlayback = useCallback(async () => {
    if (useChordGridStore.getState().isPlaying) {
      await stopPlayback();
    } else {
      await startPlayback();
    }
  }, [startPlayback, stopPlayback]);

  return { togglePlayback, stopPlayback, startPlayback };
}
