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
