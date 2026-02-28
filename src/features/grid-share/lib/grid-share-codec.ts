import { MAX_SHARE_URL_LENGTH, QUERY_PARAMS } from "@/config/query-params";
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

// --- コンパクト中間形式 ---
// セルをタプルで表現し、null セルを省略することで大幅にサイズ削減
type CompactCell = [
  number, // row index
  number, // col index
  string, // rootName
  string, // quality
  string, // symbol
  string, // source
  string, // chordFunction
  string, // romanNumeral
  number, // degree
];

type CompactData = {
  c: CompactCell[];
  r: number; // 行数
  b: number; // bpm
  k: string; // key rootName
  t: number; // chordType: 0=triad, 1=seventh
  m: string; // selectedMode
};

function toCompact(data: ShareData): CompactData {
  const cells: CompactCell[] = [];
  for (let r = 0; r < data.grid.rows.length; r++) {
    const row = data.grid.rows[r];
    for (let c = 0; c < row.length; c++) {
      const chord = row[c];
      if (chord) {
        cells.push([
          r,
          c,
          chord.rootName,
          chord.quality,
          chord.symbol,
          chord.source,
          chord.chordFunction,
          chord.romanNumeral,
          chord.degree,
        ]);
      }
    }
  }
  return {
    c: cells,
    r: data.grid.rows.length,
    b: data.grid.bpm,
    k: data.key.rootName,
    t: data.key.chordType === "seventh" ? 1 : 0,
    m: data.key.selectedMode,
  };
}

const DEFAULT_COLUMNS = 16;

function fromCompact(compact: CompactData): ShareData {
  let colCount = DEFAULT_COLUMNS;
  for (const cell of compact.c) {
    if (cell[1] >= colCount) colCount = cell[1] + 1;
  }

  const rows: (GridChord | null)[][] = Array.from({ length: compact.r }, () =>
    Array.from({ length: colCount }, () => null)
  );
  for (const [
    r,
    c,
    rootName,
    quality,
    symbol,
    source,
    chordFunction,
    romanNumeral,
    degree,
  ] of compact.c) {
    rows[r][c] = {
      rootName,
      quality: quality as GridChord["quality"],
      symbol,
      source: source as GridChord["source"],
      chordFunction: chordFunction as GridChord["chordFunction"],
      romanNumeral,
      degree,
    };
  }
  return {
    grid: { rows, bpm: compact.b },
    key: {
      rootName: compact.k,
      chordType: compact.t === 1 ? "seventh" : "triad",
      selectedMode: compact.m as SelectedMode,
    },
  };
}

// --- DeflateRaw 圧縮/展開（ブラウザ組み込み CompressionStream） ---

async function deflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const cs = new CompressionStream("deflate-raw");
  const writer = cs.writable.getWriter();
  writer.write(data as unknown as BufferSource).catch(() => {});
  writer.close().catch(() => {});
  return collectStream(cs.readable);
}

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream("deflate-raw");
  const writer = ds.writable.getWriter();
  writer.write(data as unknown as BufferSource).catch(() => {});
  writer.close().catch(() => {});
  return collectStream(ds.readable);
}

async function collectStream(readable: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  if (chunks.length === 1) return chunks[0];
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

// --- Base64url ---

function toBase64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64url(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const remainder = base64.length % 4;
  if (remainder === 2) base64 += "==";
  else if (remainder === 3) base64 += "=";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// --- 公開 API ---

/**
 * ShareData を圧縮して URL-safe な文字列にエンコードする
 */
export async function encodeGridData(data: ShareData): Promise<string> {
  const compact = toCompact(data);
  const json = JSON.stringify(compact);
  const raw = new TextEncoder().encode(json);
  const compressed = await deflateRaw(raw);
  return toBase64url(compressed);
}

/**
 * URL-safe 文字列をデコード・展開して ShareData に復元する
 * 不正なデータの場合は null を返す
 */
export async function decodeGridData(encoded: string): Promise<ShareData | null> {
  if (!encoded) return null;
  try {
    const compressed = fromBase64url(encoded);
    const raw = await inflateRaw(compressed);
    const json = new TextDecoder().decode(raw);
    const compact: unknown = JSON.parse(json);
    if (!isCompactData(compact)) return null;
    return fromCompact(compact);
  } catch {
    return null;
  }
}

/**
 * 共有 URL を構築する
 * URL が長すぎる場合は null を返す
 */
export async function buildShareUrl(baseUrl: string, data: ShareData): Promise<string | null> {
  const encoded = await encodeGridData(data);
  const url = new URL(baseUrl);
  url.searchParams.set(QUERY_PARAMS.GRID_DATA, encoded);
  const result = url.toString();
  if (result.length > MAX_SHARE_URL_LENGTH) return null;
  return result;
}

/**
 * URL から ShareData をパースする
 * クエリパラメータがない、または不正な場合は null を返す
 */
export async function parseShareUrl(urlString: string): Promise<ShareData | null> {
  try {
    const url = new URL(urlString);
    const encoded = url.searchParams.get(QUERY_PARAMS.GRID_DATA);
    if (!encoded) return null;
    return await decodeGridData(encoded);
  } catch {
    return null;
  }
}

function isCompactData(value: unknown): value is CompactData {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (!Array.isArray(obj.c)) return false;
  if (typeof obj.r !== "number") return false;
  if (typeof obj.b !== "number") return false;
  if (typeof obj.k !== "string") return false;
  if (typeof obj.t !== "number") return false;
  if (typeof obj.m !== "string") return false;
  return true;
}
