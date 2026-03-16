import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type PageTransitionProps = ComponentProps<"div">;

export function PageTransition({ className, children, ...props }: PageTransitionProps) {
  return (
    <div
      className={cn("animate-page-enter", className)}
      style={{ viewTransitionName: "page-content" }}
      {...props}
    >
      {children}
    </div>
  );
}
