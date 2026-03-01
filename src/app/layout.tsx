import type { Metadata } from "next";
import { Noto_Serif } from "next/font/google";
import { Header, HeaderGitHubLink, HeaderLogo, HeaderNav, HeaderNavList } from "@/components";
import { Providers } from "./providers";
import "./globals.css";

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Linnet",
    template: "%s | Linnet",
  },
  description:
    "キーを選んでダイアトニックコードを一覧表示。ドラッグ&ドロップでコード進行を組み立て、ギター指板上で構成音やスケールを確認できるリファレンスツール。",
  openGraph: {
    title: "Linnet",
    description: "ギターコード進行リファレンスツール",
    siteName: "Linnet",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Linnet",
    description: "ギターコード進行リファレンスツール",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={notoSerif.variable}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, interactive-widget=resizes-content"
        />
      </head>
      <body className="antialiased">
        <Providers>
          <Header>
            <HeaderLogo />
            <HeaderNav>
              <HeaderNavList />
              <HeaderGitHubLink url="https://github.com" />
            </HeaderNav>
          </Header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
