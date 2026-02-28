"use client";

import { useEffect, useRef } from "react";
import { addToast } from "@/components/ui/toast";
import { QUERY_PARAMS } from "@/config/query-params";
import { useChordGridStore } from "@/features/chord-grid/stores/chord-grid-store";
import { useKeyStore } from "@/features/key-selection/stores/key-store";
import { decodeGridData } from "../lib/grid-share-codec";

/**
 * URLのクエリパラメータからグリッドデータを読み取り、ストアを初期化するフック
 * 読み取り後、クエリパラメータをURLから除去する（ブラウザ履歴は置換）
 */
export function useGridShareInit(): void {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const params = new URLSearchParams(window.location.search);
    const encoded = params.get(QUERY_PARAMS.GRID_DATA);
    if (!encoded) return;

    (async () => {
      const data = await decodeGridData(encoded);
      if (!data) {
        addToast("共有リンクのデータを読み取れませんでした", "error");
        return;
      }

      // Grid ストアに反映
      useChordGridStore.setState({
        rows: data.grid.rows,
        bpm: data.grid.bpm,
        isPlaying: false,
        currentRow: -1,
        currentCol: -1,
        selectedCell: null,
      });

      // Key ストアに反映
      useKeyStore.setState({
        rootName: data.key.rootName,
        chordType: data.key.chordType,
        selectedMode: data.key.selectedMode,
      });

      // クエリパラメータを除去（履歴は置換）
      const url = new URL(window.location.href);
      url.searchParams.delete(QUERY_PARAMS.GRID_DATA);
      window.history.replaceState({}, "", url.pathname + url.search);

      addToast("共有されたコード進行を読み込みました");
    })();
  }, []);
}
