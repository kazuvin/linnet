export type NavItem = {
  readonly href: string;
  readonly label: string;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "コード進行" },
  { href: "/chord-scale", label: "コード・スケール検索" },
  { href: "/chord-search", label: "コード検索" },
] as const;

export const GITHUB_URL = "https://github.com";
