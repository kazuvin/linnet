"use client";

import { Toaster } from "@/components/ui/toast";
import { useGridShareInit } from "@/features/grid-share";

export function Providers({ children }: { children: React.ReactNode }) {
  useGridShareInit();

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
