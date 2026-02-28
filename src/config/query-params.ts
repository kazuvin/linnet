/**
 * 共有URL用クエリパラメータの定数定義
 * パラメータ名を変更したい場合はここを修正する
 */
export const QUERY_PARAMS = {
  /** グリッドデータ（圧縮+Base64エンコード済み） */
  GRID_DATA: "g",
} as const;

/**
 * 共有URLの最大文字数
 * ブラウザ間の互換性を考慮した安全な上限値
 */
export const MAX_SHARE_URL_LENGTH = 2000;
