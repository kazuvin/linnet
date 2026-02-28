"use client";

import { useCallback, useEffect, useRef } from "react";
import { useChordPlaybackStore } from "@/features/chord-playback/stores/chord-playback-store";
import { useChordProgressionStore } from "@/features/chord-progression/stores/chord-progression-store";
import { startSustainChord, stopAllSound } from "@/lib/audio/chord-player";
import type { GridChord } from "../stores/chord-grid-store";
import { COLUMNS, useChordGridStore } from "../stores/chord-grid-store";

/**
 * グリッドのループ再生を管理するフック。
 * BPM に基づいて 16 分音符ごとにステップを進め、
 * コードが配置されたセルでは音を鳴らし、フレットボードのスケール表示を更新する。
 * 複数行を順番に再生し、最終行の終端でループする。
 * 「-」セルではコードが持続して鳴り続ける。
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
    const playableRowCount = gridState.getPlayableRowCount();
    const playableRows = gridState.rows.slice(0, playableRowCount);
    const hasChords = playableRows.some((row) => row.some((c) => c !== null));
    if (!hasChords) return;

    useChordGridStore.getState().setPlaying(true);
    useChordGridStore.getState().setCurrentPosition(0, 0);

    // 最初のステップを即座に処理
    const chord = gridState.getChordAtPosition(0, 0);
    if (chord) {
      lastChordRef.current = chord;
      useChordProgressionStore.getState().setActiveChordOverride({
        id: `grid-${chord.rootName}-${chord.quality}`,
        ...chord,
      });
      if (!useChordPlaybackStore.getState().isMuted) {
        startSustainChord(chord.rootName, chord.quality);
      }
    }

    const intervalMs = (60 * 1000) / gridState.bpm / 4;
    let row = 0;
    let col = 0;

    timerRef.current = setInterval(() => {
      const state = useChordGridStore.getState();

      if (!state.isPlaying) {
        stopPlayback();
        return;
      }

      // 次のステップへ
      col = col + 1;
      if (col >= COLUMNS) {
        col = 0;
        row = row + 1;
        // 最後の行（バッファ行）は再生対象外
        const playableCount = state.getPlayableRowCount();
        if (row >= playableCount) {
          row = 0;
        }
      }

      useChordGridStore.getState().setCurrentPosition(row, col);
      const cellChord = state.rows[row]?.[col] ?? null;
      const currentChord = state.getChordAtPosition(row, col);

      if (cellChord !== null) {
        // 新しいコードセルに到達: 音を鳴らす
        if (!useChordPlaybackStore.getState().isMuted) {
          startSustainChord(cellChord.rootName, cellChord.quality);
        }
      }
      // null セルで前のコードがない場合（無音区間に入った場合）: 音を止める
      if (currentChord === null && lastChordRef.current !== null) {
        stopAllSound();
      }

      // フレットボードのスケール表示を更新
      if (currentChord) {
        if (
          !lastChordRef.current ||
          currentChord.rootName !== lastChordRef.current.rootName ||
          currentChord.quality !== lastChordRef.current.quality
        ) {
          useChordProgressionStore.getState().setActiveChordOverride({
            id: `grid-${currentChord.rootName}-${currentChord.quality}`,
            ...currentChord,
          });
        }
      }
      lastChordRef.current = currentChord;
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
