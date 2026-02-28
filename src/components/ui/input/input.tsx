import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type InputProps = Omit<ComponentProps<"input">, "size"> & {
  variant?: "default" | "error";
  size?: "sm" | "md" | "lg";
};

export function Input({ variant = "default", size = "md", className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}

const variantStyles = {
  default:
    "bg-stone-100 rounded-2xl placeholder:text-foreground/50 outline-transparent focus:outline-indigo-300 outline-2",
  error:
    "border-red-500 text-foreground placeholder:text-foreground/50 focus:border-red-500 focus:ring-red-500",
} as const;

const sizeStyles = {
  sm: "px-3 py-2 text-base sm:text-sm",
  md: "px-4 py-3 text-base",
  lg: "px-5 py-4 text-lg",
} as const;
