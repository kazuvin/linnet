"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

interface UseScrollToTopOptions {
  onRouteChange?: () => void;
}

/**
 * Custom hook that scrolls to top on route changes.
 * Disables browser's automatic scroll restoration to ensure
 * consistent behavior on back/forward navigation.
 */
export function useScrollToTop(options: UseScrollToTopOptions = {}) {
  const { onRouteChange } = options;
  const pathname = usePathname();
  const previousPathRef = useRef(pathname);

  // Disable browser's automatic scroll restoration on back/forward navigation
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (previousPathRef.current !== pathname) {
      previousPathRef.current = pathname;
      window.scrollTo(0, 0);
      onRouteChange?.();
    }
  }, [pathname, onRouteChange]);
}
