export type CharItem =
  | { char: string; type: "stay"; oldIndex: number }
  | { char: string; type: "enter" };

export type CharExit = {
  char: string;
  oldIndex: number;
};

export type CharDiffResult = {
  items: CharItem[];
  exits: CharExit[];
};

/**
 * 旧テキストと新テキストの文字差分を計算する。
 * 共通文字は順序を保って "stay"、新しい文字は "enter"、消えた文字は "exits" に分類される。
 */
export type DisplayChar = {
  id: string;
  char: string;
  state: "stable" | "entering" | "exiting";
};

/**
 * 旧表示文字リストと差分結果をマージして、新しい表示文字リストを生成する。
 * stay 文字は ID を保持し、exit 文字は旧位置に配置、enter 文字は新 ID で追加される。
 */
export function mergeDisplayChars(
  oldChars: DisplayChar[],
  diff: CharDiffResult,
  genId: () => string
): DisplayChar[] {
  const stableOld = oldChars.filter((c) => c.state !== "exiting");
  const exitIndices = new Set(diff.exits.map((e) => e.oldIndex));

  // stay 文字の oldIndex → newIndex マッピング
  const oldToNew = new Map<number, number>();
  diff.items.forEach((item, ni) => {
    if (item.type === "stay") oldToNew.set(item.oldIndex, ni);
  });

  const result: DisplayChar[] = [];
  let nextNewIdx = 0;

  // 旧テキストの順序を基準に走査し、enter 文字を適切な位置に挿入
  for (let oi = 0; oi < stableOld.length; oi++) {
    if (oldToNew.has(oi)) {
      const targetNewIdx = oldToNew.get(oi) ?? 0;
      // この stay の前にある enter を挿入
      while (nextNewIdx < targetNewIdx) {
        const item = diff.items[nextNewIdx];
        if (item.type === "enter") {
          result.push({ id: genId(), char: item.char, state: "entering" });
        }
        nextNewIdx++;
      }
      result.push({ ...stableOld[oi], state: "stable" });
      nextNewIdx = targetNewIdx + 1;
    } else if (exitIndices.has(oi)) {
      result.push({ ...stableOld[oi], state: "exiting" });
    }
  }

  // 残りの enter 文字を追加
  while (nextNewIdx < diff.items.length) {
    const item = diff.items[nextNewIdx];
    if (item.type === "enter") {
      result.push({ id: genId(), char: item.char, state: "entering" });
    }
    nextNewIdx++;
  }

  return result;
}

export function computeCharDiff(oldText: string, newText: string): CharDiffResult {
  const oldUsed = new Set<number>();
  const matches = new Map<number, number>(); // newIndex → oldIndex

  let oldSearchStart = 0;
  for (let ni = 0; ni < newText.length; ni++) {
    for (let oi = oldSearchStart; oi < oldText.length; oi++) {
      if (newText[ni] === oldText[oi] && !oldUsed.has(oi)) {
        matches.set(ni, oi);
        oldUsed.add(oi);
        oldSearchStart = oi + 1;
        break;
      }
    }
  }

  const items: CharItem[] = [];
  for (let ni = 0; ni < newText.length; ni++) {
    const oldIndex = matches.get(ni);
    if (oldIndex !== undefined) {
      items.push({ char: newText[ni], type: "stay", oldIndex });
    } else {
      items.push({ char: newText[ni], type: "enter" });
    }
  }

  const exits: CharExit[] = [];
  for (let oi = 0; oi < oldText.length; oi++) {
    if (!oldUsed.has(oi)) {
      exits.push({ char: oldText[oi], oldIndex: oi });
    }
  }

  return { items, exits };
}
