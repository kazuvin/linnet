import type { IconProps } from "./types";

export function PlayIcon({ className, ...props }: IconProps) {
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
      <polygon points="6,3 20,12 6,21" />
    </svg>
  );
}
