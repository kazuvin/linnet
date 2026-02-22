"use client";

import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

/** Visual variant of the tab nav */
export type TabNavVariant = "primary" | "secondary" | "ghost";

/** Size of the tab nav */
export type TabNavSize = "sm" | "md" | "lg";

/** Props for the TabNav component */
export type TabNavProps = Omit<ComponentProps<"div">, "onChange"> & {
  /** Currently selected value */
  value: string;
  /** Callback when selection changes */
  onValueChange: (value: string) => void;
  /** Visual variant of the tab nav */
  variant?: TabNavVariant;
  /** Size of the tab nav */
  size?: TabNavSize;
  /** Children (TabNavItem components) */
  children: ReactNode;
};

/** Props for the TabNav.Item component */
export type TabNavItemProps = Omit<ComponentProps<"button">, "value"> & {
  /** Unique value for this item */
  value: string;
  /** Content of the item */
  children: ReactNode;
};

/** Internal context for TabNav */
type TabNavContextValue = {
  selectedValue: string;
  onSelect: (value: string) => void;
  variant: TabNavVariant;
  size: TabNavSize;
  registerItem: (value: string, element: HTMLButtonElement) => void;
  unregisterItem: (value: string) => void;
};

// ============================================================================
// Constants
// ============================================================================

/** Base styles for the tab nav container */
const containerBaseStyles = [
  "relative inline-flex items-center gap-1 rounded-full p-1",
  "bg-foreground/5",
] as const;

/** Base styles for the indicator */
const indicatorBaseStyles = [
  "absolute rounded-full",
  "transition-all duration-300 ease-spring",
] as const;

/** Indicator styles for each variant */
const indicatorVariantStyles = {
  primary: "bg-foreground",
  secondary: "bg-foreground/10 border border-foreground/20",
  ghost: "bg-foreground/10",
} as const;

/** Base styles for button items */
const itemBaseStyles = [
  "relative z-10 inline-flex items-center justify-center rounded-full font-medium",
  "transition-colors duration-200 ease-default",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
  "disabled:cursor-not-allowed disabled:opacity-50",
] as const;

/** Item text styles for each variant when selected */
const itemSelectedStyles = {
  primary: "text-background",
  secondary: "text-foreground",
  ghost: "text-foreground",
} as const;

/** Item text styles for each variant when not selected */
const itemUnselectedStyles = {
  primary: "text-foreground/70 hover:text-foreground",
  secondary: "text-foreground/70 hover:text-foreground",
  ghost: "text-foreground/70 hover:text-foreground",
} as const;

/** Size styles for items */
const itemSizeStyles = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-1.5 text-sm",
  lg: "px-5 py-2 text-base",
} as const;

// ============================================================================
// Context
// ============================================================================

const TabNavContext = createContext<TabNavContextValue | null>(null);

function useTabNavContext() {
  const context = useContext(TabNavContext);
  if (!context) {
    throw new Error("TabNavItem must be used within a TabNav");
  }
  return context;
}

// ============================================================================
// Hook for safe layout effect
// ============================================================================

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// ============================================================================
// TabNavItem Component
// ============================================================================

export function TabNavItem({ value, children, className, disabled, ...props }: TabNavItemProps) {
  const { selectedValue, onSelect, variant, size, registerItem, unregisterItem } =
    useTabNavContext();
  const ref = useRef<HTMLButtonElement>(null);
  const isSelected = selectedValue === value;

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (element) {
      registerItem(value, element);
    }
    return () => {
      unregisterItem(value);
    };
  }, [value, registerItem, unregisterItem]);

  const handleClick = () => {
    if (!disabled) {
      onSelect(value);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        itemBaseStyles,
        itemSizeStyles[size],
        isSelected ? itemSelectedStyles[variant] : itemUnselectedStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ============================================================================
// TabNav Component
// ============================================================================

/**
 * A tab navigation component with an animated sliding indicator.
 * Supports multiple visual variants and sizes.
 *
 * @example
 * ```tsx
 * <TabNav value={selected} onValueChange={setSelected}>
 *   <TabNavItem value="tab1">Tab 1</TabNavItem>
 *   <TabNavItem value="tab2">Tab 2</TabNavItem>
 *   <TabNavItem value="tab3">Tab 3</TabNavItem>
 * </TabNav>
 * ```
 */
function TabNavRoot({
  value,
  onValueChange,
  variant = "primary",
  size = "md",
  children,
  className,
  ...props
}: TabNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const registerItem = useCallback((itemValue: string, element: HTMLButtonElement) => {
    itemsRef.current.set(itemValue, element);
  }, []);

  const unregisterItem = useCallback((itemValue: string) => {
    itemsRef.current.delete(itemValue);
  }, []);

  const updateIndicator = useCallback(() => {
    const container = containerRef.current;
    const selectedElement = itemsRef.current.get(value);

    if (container && selectedElement) {
      const containerRect = container.getBoundingClientRect();
      const selectedRect = selectedElement.getBoundingClientRect();

      setIndicatorStyle({
        left: selectedRect.left - containerRect.left,
        width: selectedRect.width,
        height: selectedRect.height,
      });
    }
  }, [value]);

  // Update indicator position when value changes or on mount
  useIsomorphicLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  // Also update on resize
  useEffect(() => {
    const handleResize = () => {
      updateIndicator();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [updateIndicator]);

  // Update indicator after a short delay to ensure items are rendered
  useEffect(() => {
    const timeoutId = setTimeout(updateIndicator, 0);
    return () => clearTimeout(timeoutId);
  }, [updateIndicator]);

  const contextValue: TabNavContextValue = {
    selectedValue: value,
    onSelect: onValueChange,
    variant,
    size,
    registerItem,
    unregisterItem,
  };

  return (
    <TabNavContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        role="tablist"
        className={cn(containerBaseStyles, className)}
        {...props}
      >
        {/* Animated indicator */}
        {indicatorStyle && (
          <span
            className={cn(indicatorBaseStyles, indicatorVariantStyles[variant])}
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              height: indicatorStyle.height,
              top: "50%",
              transform: "translateY(-50%)",
            }}
            aria-hidden="true"
          />
        )}
        {children}
      </div>
    </TabNavContext.Provider>
  );
}

// ============================================================================
// Export
// ============================================================================

export { TabNavRoot as TabNav };
