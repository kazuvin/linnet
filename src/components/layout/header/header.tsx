"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";
import { GitHubIcon, MenuIcon } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsScrolled } from "@/lib/animation";
import { cn } from "@/lib/utils";

export type HeaderProps = ComponentProps<"header">;

export function Header({ className, children, ...props }: HeaderProps) {
  const isScrolled = useIsScrolled();

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-50 border-b bg-background transition-all duration-200 ease-out",
        isScrolled ? "border-foreground/10 pt-0" : "border-transparent pt-4",
        className
      )}
      {...props}
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {children}
      </div>
    </header>
  );
}

export type HeaderLogoProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href?: string;
};

export function HeaderLogo({ href = "/", className, onClick, ...props }: HeaderLogoProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-tonic via-subdominant to-dominant shadow-md transition-all duration-300 ease-out hover:scale-110 hover:shadow-lg hover:shadow-purple-500/40",
        className
      )}
      aria-label="Home"
      onClick={(e) => {
        if (isActive) {
          e.preventDefault();
        }
        onClick?.(e);
      }}
      {...props}
    >
      {/* Animated gradient overlay */}
      <span className="absolute inset-0 bg-gradient-to-br from-tonic via-subdominant to-dominant opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {/* Shimmer effect */}
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-500 ease-out group-hover:translate-x-full" />
    </Link>
  );
}

export type HeaderNavProps = ComponentProps<"nav">;

export function HeaderNav({ className, children, ...props }: HeaderNavProps) {
  return (
    <nav className={cn("flex items-center gap-6", className)} {...props}>
      {children}
    </nav>
  );
}

export type HeaderNavListProps = ComponentProps<"ul">;

export function HeaderNavList({ className, children, ...props }: HeaderNavListProps) {
  return (
    <ul className={cn("flex items-center gap-6", className)} {...props}>
      {children}
    </ul>
  );
}

export type HeaderNavItemProps = ComponentProps<typeof Link>;

export function HeaderNavItem({ className, children, href, ...props }: HeaderNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <li>
      <Link
        href={href}
        className={cn(
          "font-medium text-sm transition-colors hover:text-foreground",
          isActive ? "text-foreground" : "text-foreground/60",
          className
        )}
        {...props}
      >
        {children}
      </Link>
    </li>
  );
}

export type HeaderActionProps = ComponentProps<"a"> & {
  icon?: ReactNode;
};

export function HeaderAction({ className, icon, children, ...props }: HeaderActionProps) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={cn("text-foreground/60 transition-colors hover:text-foreground", className)}
      {...props}
    >
      {icon ?? children}
    </a>
  );
}

export type HeaderGitHubLinkProps = Omit<ComponentProps<"a">, "children"> & {
  /** GitHub repository URL */
  url: string;
};

export function HeaderGitHubLink({ url, className, ...props }: HeaderGitHubLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full text-foreground/60 transition-colors hover:text-foreground md:h-auto md:w-auto",
        className
      )}
      aria-label="GitHub repository"
      {...props}
    >
      <GitHubIcon className="h-5 w-5" />
    </a>
  );
}

export type HeaderMobileMenuProps = {
  items: { href: string; label: string }[];
  gitHubUrl?: string;
};

export function HeaderMobileMenu({ items, gitHubUrl }: HeaderMobileMenuProps) {
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground/60 transition-colors hover:text-foreground"
            aria-label="メニューを開く"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="min-w-[200px]">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <DropdownMenuItem key={item.href} asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "w-full font-medium",
                    isActive ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  {item.label}
                </Link>
              </DropdownMenuItem>
            );
          })}
          {gitHubUrl && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a
                  href={gitHubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-2 text-foreground/60"
                >
                  <GitHubIcon className="h-4 w-4" />
                  GitHub
                </a>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
