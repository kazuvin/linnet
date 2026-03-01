"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
            padding: "16px",
            fontFamily: "'Noto Serif', serif",
            background: "#f5f3ee",
            color: "#1a1a1a",
          }}
        >
          <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>エラーが発生しました</h2>
          <p style={{ fontSize: "14px", color: "#888" }}>
            アプリケーションの読み込みに失敗しました。
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#fff",
              background: "#6b3fa0",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            ページをリロード
          </button>
        </div>
      </body>
    </html>
  );
}
