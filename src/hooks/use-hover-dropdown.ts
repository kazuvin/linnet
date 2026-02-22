import { useCallback, useRef, useState } from "react";

export interface UseHoverDropdownOptions {
  closeDelay?: number;
}

export interface UseHoverDropdownReturn {
  isOpen: boolean;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  handleOpenChange: (open: boolean) => void;
  close: () => void;
}

/**
 * Custom hook for managing dropdown open/close state with hover behavior
 *
 * @param options - Configuration options
 * @param options.closeDelay - Delay in ms before closing the dropdown (default: 100)
 * @returns Handlers and state for hover-based dropdown
 */
export function useHoverDropdown(options: UseHoverDropdownOptions = {}): UseHoverDropdownReturn {
  const { closeDelay = 100 } = options;

  const [isOpen, setIsOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveredRef = useRef(false);

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    isHoveredRef.current = true;
    clearCloseTimeout();
    setIsOpen(true);
  }, [clearCloseTimeout]);

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false;
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      if (!isHoveredRef.current) {
        setIsOpen(false);
      }
    }, closeDelay);
  }, [clearCloseTimeout, closeDelay]);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  const close = useCallback(() => {
    isHoveredRef.current = false;
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    handleMouseEnter,
    handleMouseLeave,
    handleOpenChange,
    close,
  };
}
