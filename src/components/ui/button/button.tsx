"use client";

import { type ComponentProps, type RefObject, useRef } from "react";
import { LoadingSpinnerIcon } from "@/components/icons";
import { useElementDimensions } from "@/lib/animation";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

/** The possible states of a stateful button */
export type ButtonState = "idle" | "loading" | "success" | "error";

/** Props for the Button component */
export type ButtonProps = Omit<ComponentProps<"button">, "children"> & {
  /** Current state of the button */
  state?: ButtonState;
  /** Visual variant of the button */
  variant?: "primary" | "secondary" | "ghost";
  /** Size of the button */
  size?: "sm" | "md" | "lg";
  /** Text displayed in idle state */
  idleText?: string;
  /** Text displayed in loading state */
  loadingText?: string;
  /** Text displayed in success state */
  successText?: string;
  /** Text displayed in error state */
  errorText?: string;
};

/** Common props for icon components */
type IconProps = {
  className?: string;
};

// ============================================================================
// Constants
// ============================================================================

/** All possible button states in order */
const BUTTON_STATES: readonly ButtonState[] = ["idle", "loading", "success", "error"] as const;

/** Base styles applied to all button variants */
const baseStyles = [
  "inline-flex items-center justify-center rounded-full font-medium",
  "transition-all duration-300 ease-default",
  "focus:outline-none focus:ring-2 focus:ring-offset-2",
  "disabled:cursor-not-allowed disabled:opacity-50",
] as const;

/** Styles for each button variant in idle state */
const variantStyles = {
  primary: "bg-foreground text-background hover:opacity-90 focus:ring-foreground",
  secondary:
    "bg-transparent text-foreground border border-foreground/20 hover:bg-foreground/5 focus:ring-foreground",
  ghost: "bg-transparent text-foreground hover:bg-foreground/10 focus:ring-foreground",
} as const;

/** Styles for each button variant in loading state */
const loadingStyles = {
  primary: "bg-foreground/80 text-background focus:ring-foreground",
  secondary: "bg-foreground/5 text-foreground border border-foreground/20 focus:ring-foreground",
  ghost: "bg-foreground/5 text-foreground focus:ring-foreground",
} as const;

/** Styles for success state */
const successStyles =
  "bg-green-600 text-white hover:bg-green-600 focus:ring-green-600 border-transparent";

/** Styles for error state */
const errorStyles = "bg-red-600 text-white hover:bg-red-600 focus:ring-red-600 border-transparent";

/** Styles for each button size */
const sizeStyles = {
  sm: "px-4 py-2.5 text-sm md:px-3 md:py-1.5",
  md: "px-5 py-2.5 text-sm font-semibold md:px-4 md:py-2",
  lg: "px-6 py-3 text-lg",
} as const;

// ============================================================================
// Icon Components
// ============================================================================

/** Check icon for success state with optional draw animation */
function CheckIcon({ className, isAnimated }: IconProps & { isAnimated?: boolean }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
        style={
          isAnimated
            ? {
                strokeDasharray: 24,
                strokeDashoffset: 24,
                animation: "draw 0.3s ease forwards 0.45s",
              }
            : undefined
        }
      />
    </svg>
  );
}

/** X icon for error state */
function XIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// ============================================================================
// Icon State Configuration
// ============================================================================

/** Configuration for each state's icon */
type IconConfig = {
  state: ButtonState;
  animationClass?: string;
  render: (isActive: boolean) => React.ReactNode;
};

const iconConfigs: IconConfig[] = [
  {
    state: "loading",
    render: () => <LoadingSpinnerIcon className="h-4 w-4" />,
  },
  {
    state: "success",
    animationClass: "animate-check-bounce",
    render: (isActive) => <CheckIcon className="h-4 w-4" isAnimated={isActive} />,
  },
  {
    state: "error",
    animationClass: "animate-shake",
    render: () => <XIcon className="h-4 w-4" />,
  },
];

// ============================================================================
// Helper Components
// ============================================================================

type IconContainerProps = {
  state: ButtonState;
};

/** Container for state icons with fade animations */
function IconContainer({ state }: IconContainerProps) {
  const hasIcon = state !== "idle";

  return (
    <span
      className={cn(
        "inline-grid transition-all duration-300",
        hasIcon ? "w-4 opacity-100" : "w-0 opacity-0"
      )}
    >
      {iconConfigs.map(({ state: iconState, animationClass, render }) => {
        const isActive = state === iconState;
        return (
          <span
            key={iconState}
            className={cn(
              "col-start-1 row-start-1 transition-opacity duration-300",
              isActive ? cn("opacity-100", animationClass) : "opacity-0"
            )}
          >
            {render(isActive)}
          </span>
        );
      })}
    </span>
  );
}

type TextContainerProps = {
  state: ButtonState;
  texts: Record<ButtonState, string>;
  textRefs: Record<ButtonState, RefObject<HTMLSpanElement | null>>;
  width: number | undefined;
};

/** Container for state text with width animation */
function TextContainer({ state, texts, textRefs, width }: TextContainerProps) {
  return (
    <span
      className="relative inline-flex items-center justify-center transition-[width] duration-300"
      style={{ width }}
    >
      {BUTTON_STATES.map((s) => (
        <span
          key={s}
          ref={textRefs[s]}
          className={cn(
            "whitespace-nowrap transition-opacity duration-300",
            s === state
              ? "relative opacity-100"
              : "absolute inset-0 flex items-center justify-center opacity-0"
          )}
        >
          {texts[s]}
        </span>
      ))}
    </span>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * A button component that displays different states with smooth animations.
 * Supports idle, loading, success, and error states with corresponding icons and text.
 */
export function Button({
  state = "idle",
  variant = "primary",
  size = "md",
  idleText = "Submit",
  loadingText = "Loading...",
  successText = "Success!",
  errorText = "Error!",
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || state === "loading";
  const hasIcon = state !== "idle";

  const texts: Record<ButtonState, string> = {
    idle: idleText,
    loading: loadingText,
    success: successText,
    error: errorText,
  };

  const idleRef = useRef<HTMLSpanElement>(null);
  const loadingRef = useRef<HTMLSpanElement>(null);
  const successRef = useRef<HTMLSpanElement>(null);
  const errorRef = useRef<HTMLSpanElement>(null);

  const textRefs: Record<ButtonState, RefObject<HTMLSpanElement | null>> = {
    idle: idleRef,
    loading: loadingRef,
    success: successRef,
    error: errorRef,
  };

  const { width: textWidth } = useElementDimensions(textRefs[state], { type: "width" });

  return (
    <button
      className={cn(
        baseStyles,
        hasIcon ? "gap-2" : "gap-0",
        sizeStyles[size],
        state === "idle" && variantStyles[variant],
        state === "loading" && loadingStyles[variant],
        state === "success" && successStyles,
        state === "error" && errorStyles,
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      <IconContainer state={state} />
      <TextContainer state={state} texts={texts} textRefs={textRefs} width={textWidth} />
    </button>
  );
}
