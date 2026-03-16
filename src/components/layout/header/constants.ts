export type NavItem = {
  readonly href: string;
  readonly label: string;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "コード進行" },
  { href: "/scale-chord", label: "スケールからコード検索" },
  { href: "/chord-scale", label: "コードからスケール検索" },
  { href: "/chord-search", label: "フレットからコード検索" },
] as const;

export const GITHUB_URL = "https://github.com";
