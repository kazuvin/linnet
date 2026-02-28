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
  description: "Linnet application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={notoSerif.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
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
