import { QUERY_PARAMS } from "@/config/query-params";
import type { GridChord } from "@/features/chord-grid/stores/chord-grid-store";
import type { SelectedMode } from "@/features/key-selection/stores/key-store";

export type ShareData = {
  grid: {
    rows: (GridChord | null)[][];
    bpm: number;
  };
  key: {
    rootName: string;
    chordType: "triad" | "seventh";
    selectedMode: SelectedMode;
  };
};

/**
 * ShareData を URL-safe な Base64 文字列にエンコードする
 */
export function encodeGridData(data: ShareData): string {
  const json = JSON.stringify(data);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  // URL-safe: + → -, / → _, パディング除去
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * URL-safe Base64 文字列を ShareData にデコードする
 * 不正なデータの場合は null を返す
 */
export function decodeGridData(encoded: string): ShareData | null {
  if (!encoded) return null;
  try {
    // URL-safe を標準 Base64 に復元
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    // パディング復元
    const remainder = base64.length % 4;
    if (remainder === 2) base64 += "==";
    else if (remainder === 3) base64 += "=";

    const json = decodeURIComponent(escape(atob(base64)));
    const parsed: unknown = JSON.parse(json);
    if (!isShareData(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * 共有 URL を構築する
 */
export function buildShareUrl(baseUrl: string, data: ShareData): string {
  const encoded = encodeGridData(data);
  const url = new URL(baseUrl);
  url.searchParams.set(QUERY_PARAMS.GRID_DATA, encoded);
  return url.toString();
}

/**
 * URL から ShareData をパースする
 * クエリパラメータがない、または不正な場合は null を返す
 */
export function parseShareUrl(urlString: string): ShareData | null {
  try {
    const url = new URL(urlString);
    const encoded = url.searchParams.get(QUERY_PARAMS.GRID_DATA);
    if (!encoded) return null;
    return decodeGridData(encoded);
  } catch {
    return null;
  }
}

function isShareData(value: unknown): value is ShareData {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (typeof obj.grid !== "object" || obj.grid === null) return false;
  if (typeof obj.key !== "object" || obj.key === null) return false;
  const grid = obj.grid as Record<string, unknown>;
  const key = obj.key as Record<string, unknown>;
  if (!Array.isArray(grid.rows)) return false;
  if (typeof grid.bpm !== "number") return false;
  if (typeof key.rootName !== "string") return false;
  if (key.chordType !== "triad" && key.chordType !== "seventh") return false;
  if (typeof key.selectedMode !== "string") return false;
  return true;
}
