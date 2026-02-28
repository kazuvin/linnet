import { useEffect, useState } from "react";

/**
 * モバイルの仮想キーボード表示時のオフセット（px）を返すフック。
 * visualViewport API を使い、キーボードが占有する高さを計算する。
 */
export function useKeyboardOffset(): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleViewportChange = () => {
      const keyboardHeight = window.innerHeight - vv.height;
      setOffset(Math.max(0, keyboardHeight));
    };

    vv.addEventListener("resize", handleViewportChange);
    vv.addEventListener("scroll", handleViewportChange);

    return () => {
      vv.removeEventListener("resize", handleViewportChange);
      vv.removeEventListener("scroll", handleViewportChange);
    };
  }, []);

  return offset;
}
