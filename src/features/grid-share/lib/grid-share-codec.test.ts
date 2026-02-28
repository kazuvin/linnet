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
    it("エンコードした文字列をデコードすると元のデータに戻る", async () => {
      const encoded = await encodeGridData(sampleShareData);
      const decoded = await decodeGridData(encoded);
      expect(decoded).toEqual(sampleShareData);
    });

    it("エンコード結果はURL-safeな文字列になる", async () => {
      const encoded = await encodeGridData(sampleShareData);
      expect(encoded).not.toContain("+");
      expect(encoded).not.toContain("/");
      expect(encoded).not.toContain("=");
    });

    it("空のグリッドでもエンコード/デコードできる", async () => {
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
      const encoded = await encodeGridData(emptyData);
      const decoded = await decodeGridData(encoded);
      expect(decoded).toEqual(emptyData);
    });

    it("不正な文字列ではnullを返す", async () => {
      expect(await decodeGridData("invalid-data!!!")).toBeNull();
    });

    it("空文字列ではnullを返す", async () => {
      expect(await decodeGridData("")).toBeNull();
    });

    it("seventhコードタイプでもエンコード/デコードできる", async () => {
      const data: ShareData = {
        ...sampleShareData,
        key: { ...sampleShareData.key, chordType: "seventh" },
      };
      const encoded = await encodeGridData(data);
      const decoded = await decodeGridData(encoded);
      expect(decoded).toEqual(data);
    });

    it("モーダルインターチェンジのsourceでもエンコード/デコードできる", async () => {
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
      const encoded = await encodeGridData(data);
      const decoded = await decodeGridData(encoded);
      expect(decoded).toEqual(data);
    });

    it("圧縮により元のJSON Base64よりも短くなる", async () => {
      const encoded = await encodeGridData(sampleShareData);
      const naiveBase64Length = btoa(JSON.stringify(sampleShareData)).length;
      expect(encoded.length).toBeLessThan(naiveBase64Length);
    });

    it("大量のコードを含むグリッドでもエンコード/デコードできる", async () => {
      const chords: (GridChord | null)[] = Array.from({ length: 16 }, (_, i) =>
        i % 2 === 0
          ? {
              rootName: "C",
              quality: "major" as GridChord["quality"],
              symbol: "C",
              source: "diatonic" as GridChord["source"],
              chordFunction: "tonic" as GridChord["chordFunction"],
              romanNumeral: "I",
              degree: 1,
            }
          : null
      );
      const data: ShareData = {
        grid: {
          rows: [chords, chords, chords, chords],
          bpm: 200,
        },
        key: {
          rootName: "C",
          chordType: "seventh",
          selectedMode: "diatonic",
        },
      };
      const encoded = await encodeGridData(data);
      const decoded = await decodeGridData(encoded);
      expect(decoded).toEqual(data);
    });
  });

  describe("buildShareUrl / parseShareUrl", () => {
    it("共有URLを構築し、パースすると元のデータに戻る", async () => {
      const baseUrl = "https://example.com";
      const url = await buildShareUrl(baseUrl, sampleShareData);
      expect(url).not.toBeNull();
      const parsed = await parseShareUrl(url!);
      expect(parsed).toEqual(sampleShareData);
    });

    it("構築されたURLにクエリパラメータが含まれる", async () => {
      const baseUrl = "https://example.com";
      const url = await buildShareUrl(baseUrl, sampleShareData);
      expect(url).not.toBeNull();
      expect(url).toContain("?");
      expect(url).toContain("g=");
    });

    it("クエリパラメータがないURLではnullを返す", async () => {
      expect(await parseShareUrl("https://example.com")).toBeNull();
    });

    it("不正なクエリパラメータのURLではnullを返す", async () => {
      expect(await parseShareUrl("https://example.com?g=invalid")).toBeNull();
    });

    it("URLが長すぎる場合はbuildShareUrlがnullを返す", async () => {
      const manyChords: (GridChord | null)[] = Array.from({ length: 16 }, () => ({
        rootName: "C",
        quality: "major7" as GridChord["quality"],
        symbol: "Cmaj7",
        source: "diatonic" as GridChord["source"],
        chordFunction: "tonic" as GridChord["chordFunction"],
        romanNumeral: "I",
        degree: 1,
      }));
      const hugeData: ShareData = {
        grid: {
          rows: Array.from({ length: 50 }, () => [...manyChords]),
          bpm: 120,
        },
        key: {
          rootName: "C",
          chordType: "triad",
          selectedMode: "diatonic",
        },
      };
      const result = await buildShareUrl("https://example.com", hugeData);
      expect(result).toBeNull();
    });
  });
});
