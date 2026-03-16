/**
 * コード機能(トニック/サブドミナント/ドミナント)に対応するスタイル定義
 */

/** コード機能ごとのセルスタイル */
export const FUNCTION_CELL_STYLES: Record<string, string> = {
  tonic: "border-transparent bg-tonic text-tonic-foreground",
  subdominant: "border-transparent bg-subdominant text-subdominant-foreground",
  dominant: "border-transparent bg-dominant text-dominant-foreground",
};

/** サステイン表示用のスタイル */
export const SUSTAIN_CELL_STYLES: Record<string, string> = {
  tonic: "bg-tonic/40",
  subdominant: "bg-subdominant/40",
  dominant: "bg-dominant/40",
};
