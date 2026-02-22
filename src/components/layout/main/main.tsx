"use client";

import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { useScrollToTop } from "@/lib/animation";
import { cn } from "@/lib/utils";

export type MainProps = ComponentProps<"main">;

/**
 * Client component that handles scroll-to-top and fade-in animation on route changes.
 * Uses CSS animation triggered by key change for fade-in effect.
 */
export function Main({ className, children, ...props }: MainProps) {
  const pathname = usePathname();

  useScrollToTop();

  return (
    <main
      key={pathname}
      className={cn("container mx-auto animate-fade-in px-4 pt-32 pb-12", className)}
      {...props}
    >
      {children}
    </main>
  );
}
