"use client";

import { useCallback } from "react";
import { addToast } from "@/components/ui/toast";
import { useChordGridStore } from "@/features/chord-grid/stores/chord-grid-store";
import { useKeyStore } from "@/features/key-selection/stores/key-store";
import { buildShareUrl, type ShareData } from "../lib/grid-share-codec";

/**
 * コード進行を共有URLとしてクリップボードにコピーする関数を返すフック
 */
export function useShareGrid(): () => Promise<void> {
  return useCallback(async () => {
    const gridState = useChordGridStore.getState();
    const keyState = useKeyStore.getState();

    const data: ShareData = {
      grid: {
        rows: gridState.rows,
        bpm: gridState.bpm,
      },
      key: {
        rootName: keyState.rootName,
        chordType: keyState.chordType,
        selectedMode: keyState.selectedMode,
      },
    };

    const url = await buildShareUrl(window.location.origin + window.location.pathname, data);

    if (!url) {
      addToast("コード進行が大きすぎるため共有リンクを作成できません", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      addToast("共有リンクをコピーしました");
    } catch {
      addToast("クリップボードへのコピーに失敗しました", "error");
    }
  }, []);
}
