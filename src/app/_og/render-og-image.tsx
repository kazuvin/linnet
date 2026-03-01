import { ImageResponse } from "next/og";

const OG_SIZE = { width: 1200, height: 630 };

const GOOGLE_FONT_CSS_URL =
  "https://fonts.googleapis.com/css2?family=Noto+Serif:wght@700&display=swap";

async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    // Use IE11 User-Agent to get woff format (woff2 is not supported by satori in Node.js runtime)
    const css = await fetch(GOOGLE_FONT_CSS_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko",
      },
    }).then((res) => res.text());

    const url = css.match(/src: url\((.+?)\) format\('woff'\)/)?.[1];
    if (!url) return null;

    return await fetch(url).then((res) => res.arrayBuffer());
  } catch {
    return null;
  }
}

export async function renderOgImage() {
  const fontData = await loadFont();

  const fonts: { name: string; data: ArrayBuffer; style: "normal"; weight: 700 }[] = fontData
    ? [{ name: "Noto Serif", data: fontData, style: "normal" as const, weight: 700 as const }]
    : [];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #c9a0e5 0%, #a8d4c0 50%, #e5b0a8 100%)",
        fontFamily: fontData ? "Noto Serif" : "serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255, 255, 255, 0.92)",
          borderRadius: "32px",
          padding: "60px 80px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: "#1a1a1a",
            letterSpacing: "-0.02em",
          }}
        >
          Linnet
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#555555",
            marginTop: "16px",
          }}
        >
          ギターコード進行リファレンスツール
        </div>
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts,
    }
  );
}
