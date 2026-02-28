import type { ScaleType } from "./scale";

/**
 * コードの出所（ソース）を表す型。
 * ダイアトニック、セカンダリードミナント、裏コード、
 * またはモーダルインターチェンジの親スケール。
 */
export type ChordSource = "diatonic" | "secondary-dominant" | "tritone-substitution" | ScaleType;
