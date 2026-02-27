import type { IconProps } from "./types";

export function StopIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="5" y="5" width="14" height="14" rx="2" />
    </svg>
  );
}
