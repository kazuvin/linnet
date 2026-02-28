import type { GridChord } from "@/features/chord-grid/stores/chord-grid-store";
import type { SelectedMode } from "@/features/key-selection/stores/key-store";
import {
  buildShareUrl,
  decodeGridData,
  encodeGridData,
  parseShareUrl,
  type ShareData,
} from "./grid-share-codec";

const sampleChord: GridChord = {
  rootName: "C",
  quality: "major7",
  symbol: "Cmaj7",
  source: "diatonic",
  chordFunction: "tonic",
  romanNumeral: "I",
  degree: 1,
};

const sampleChord2: GridChord = {
  rootName: "A",
  quality: "minor7",
  symbol: "Am7",
  source: "diatonic",
  chordFunction: "tonic",
  romanNumeral: "vi",
  degree: 6,
};

const sampleShareData: ShareData = {
  grid: {
    rows: [
      [
        sampleChord,
        null,
        null,
        null,
        sampleChord2,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      Array.from({ length: 16 }, () => null),
    ],
    bpm: 120,
  },
  key: {
    rootName: "C",
    chordType: "triad",
    selectedMode: "diatonic" as SelectedMode,
  },
};

describe("grid-share-codec", () => {
  describe("encodeGridData / decodeGridData", () => {
    it("エンコードした文字列をデコードすると元のデータに戻る", () => {
      const encoded = encodeGridData(sampleShareData);
      const decoded = decodeGridData(encoded);
      expect(decoded).toEqual(sampleShareData);
    });

    it("エンコード結果はURL-safeな文字列になる", () => {
      const encoded = encodeGridData(sampleShareData);
      // URL-safe: +, / が - , _ に置換され、= パディングが除去される
      expect(encoded).not.toContain("+");
      expect(encoded).not.toContain("/");
      expect(encoded).not.toContain("=");
    });

    it("空のグリッドでもエンコード/デコードできる", () => {
      const emptyData: ShareData = {
        grid: {
          rows: [Array.from({ length: 16 }, () => null)],
          bpm: 120,
        },
        key: {
          rootName: "C",
          chordType: "triad",
          selectedMode: "diatonic",
        },
      };
      const encoded = encodeGridData(emptyData);
      const decoded = decodeGridData(encoded);
      expect(decoded).toEqual(emptyData);
    });

    it("不正な文字列ではnullを返す", () => {
      expect(decodeGridData("invalid-data!!!")).toBeNull();
    });

    it("空文字列ではnullを返す", () => {
      expect(decodeGridData("")).toBeNull();
    });

    it("seventhコードタイプでもエンコード/デコードできる", () => {
      const data: ShareData = {
        ...sampleShareData,
        key: { ...sampleShareData.key, chordType: "seventh" },
      };
      const encoded = encodeGridData(data);
      const decoded = decodeGridData(encoded);
      expect(decoded).toEqual(data);
    });

    it("モーダルインターチェンジのsourceでもエンコード/デコードできる", () => {
      const modalChord: GridChord = {
        ...sampleChord,
        source: "dorian",
        chordFunction: "subdominant",
      };
      const data: ShareData = {
        grid: {
          rows: [[modalChord, ...Array.from({ length: 15 }, () => null)]],
          bpm: 140,
        },
        key: {
          rootName: "G",
          chordType: "seventh",
          selectedMode: "dorian",
        },
      };
      const encoded = encodeGridData(data);
      const decoded = decodeGridData(encoded);
      expect(decoded).toEqual(data);
    });
  });

  describe("buildShareUrl / parseShareUrl", () => {
    it("共有URLを構築し、パースすると元のデータに戻る", () => {
      const baseUrl = "https://example.com";
      const url = buildShareUrl(baseUrl, sampleShareData);
      const parsed = parseShareUrl(url);
      expect(parsed).toEqual(sampleShareData);
    });

    it("構築されたURLにクエリパラメータが含まれる", () => {
      const baseUrl = "https://example.com";
      const url = buildShareUrl(baseUrl, sampleShareData);
      expect(url).toContain("?");
      expect(url).toContain("g=");
    });

    it("クエリパラメータがないURLではnullを返す", () => {
      expect(parseShareUrl("https://example.com")).toBeNull();
    });

    it("不正なクエリパラメータのURLではnullを返す", () => {
      expect(parseShareUrl("https://example.com?g=invalid")).toBeNull();
    });
  });
});
