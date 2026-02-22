import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TabNav, TabNavItem } from "./tab-nav";

describe("TabNav", () => {
  describe("Rendering", () => {
    it("renders with default value selected", () => {
      render(
        <TabNav value="tab1" onValueChange={() => {}}>
          <TabNavItem value="tab1">Tab 1</TabNavItem>
          <TabNavItem value="tab2">Tab 2</TabNavItem>
          <TabNavItem value="tab3">Tab 3</TabNavItem>
        </TabNav>
      );

      expect(screen.getByRole("tablist")).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /tab 1/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /tab 2/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /tab 3/i })).toBeInTheDocument();
    });

    it("renders with correct aria-selected for selected item", () => {
      render(
        <TabNav value="tab2" onValueChange={() => {}}>
          <TabNavItem value="tab1">Tab 1</TabNavItem>
          <TabNavItem value="tab2">Tab 2</TabNavItem>
          <TabNavItem value="tab3">Tab 3</TabNavItem>
        </TabNav>
      );

      expect(screen.getByRole("tab", { name: /tab 1/i })).toHaveAttribute("aria-selected", "false");
      expect(screen.getByRole("tab", { name: /tab 2/i })).toHaveAttribute("aria-selected", "true");
      expect(screen.getByRole("tab", { name: /tab 3/i })).toHaveAttribute("aria-selected", "false");
    });

    it("renders children content correctly", () => {
      render(
        <TabNav value="option1" onValueChange={() => {}}>
          <TabNavItem value="option1">First Option</TabNavItem>
          <TabNavItem value="option2">Second Option</TabNavItem>
        </TabNav>
      );

      expect(screen.getByText("First Option")).toBeInTheDocument();
      expect(screen.getByText("Second Option")).toBeInTheDocument();
    });
  });

  describe("Value Changes", () => {
    it("calls onValueChange when clicking an item", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(
        <TabNav value="tab1" onValueChange={onValueChange}>
          <TabNavItem value="tab1">Tab 1</TabNavItem>
          <TabNavItem value="tab2">Tab 2</TabNavItem>
          <TabNavItem value="tab3">Tab 3</TabNavItem>
        </TabNav>
      );

      await user.click(screen.getByRole("tab", { name: /tab 2/i }));

      expect(onValueChange).toHaveBeenCalledWith("tab2");
      expect(onValueChange).toHaveBeenCalledTimes(1);
    });

    it("calls onValueChange with correct value for each item", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(
        <TabNav value="tab1" onValueChange={onValueChange}>
          <TabNavItem value="option-a">Option A</TabNavItem>
          <TabNavItem value="option-b">Option B</TabNavItem>
          <TabNavItem value="option-c">Option C</TabNavItem>
        </TabNav>
      );

      await user.click(screen.getByRole("tab", { name: /option c/i }));
      expect(onValueChange).toHaveBeenLastCalledWith("option-c");

      await user.click(screen.getByRole("tab", { name: /option a/i }));
      expect(onValueChange).toHaveBeenLastCalledWith("option-a");

      await user.click(screen.getByRole("tab", { name: /option b/i }));
      expect(onValueChange).toHaveBeenLastCalledWith("option-b");
    });

    it("does not call onValueChange when clicking disabled item", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(
        <TabNav value="tab1" onValueChange={onValueChange}>
          <TabNavItem value="tab1">Tab 1</TabNavItem>
          <TabNavItem value="tab2" disabled>
            Tab 2
          </TabNavItem>
          <TabNavItem value="tab3">Tab 3</TabNavItem>
        </TabNav>
      );

      await user.click(screen.getByRole("tab", { name: /tab 2/i }));

      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe("Variants", () => {
    it("renders with primary variant by default", () => {
      render(
        <TabNav value="tab1" onValueChange={() => {}} data-testid="tab-nav">
          <TabNavItem value="tab1">Tab 1</TabNavItem>
        </TabNav>
      );

      // The component should render without error with default variant
      expect(screen.getByRole("tablist")).toBeInTheDocument();
    });

    it("renders with primary variant", () => {
      render(
        <TabNav value="tab1" onValueChange={() => {}} variant="primary">
          <TabNavItem value="tab1">Tab 1</TabNavItem>
        </TabNav>
      );

      expect(screen.getByRole("tablist")).toBeInTheDocument();
    });

    it("renders with secondary variant", () => {
      render(
        <TabNav value="tab1" onValueChange={() => {}} variant="secondary">
          <TabNavItem value="tab1">Tab 1</TabNavItem>
        </TabNav>
      );

      expect(screen.getByRole("tablist")).toBeInTheDocument();
    });

    it("renders with ghost variant", () => {
      render(
        <TabNav value="tab1" onValueChange={() => {}} variant="ghost">
          <TabNavItem value="tab1">Tab 1</TabNavItem>
        </TabNav>
      );

      expect(screen.getByRole("tablist")).toBeInTheDocument();
    });
  });

  describe("Sizes", () => {
    it("renders with md size by default", () => {
      render(
        <TabNav value="tab1" onValueChange={() => {}}>
          <TabNavItem value="tab1">Tab 1</TabNavItem>
        </TabNav>
      );

      expect(screen.getByRole("tablist")).toBeInTheDocument();
    });

    it("renders with sm size", () => {
      render(
        <TabNav value="tab1" onValueChange={() => {}} size="sm">
          <TabNavItem value="tab1" data-testid="item">
            Tab 1
          </TabNavItem>
        </TabNav>
      );

      const item = screen.getByTestId("item");
      expect(item).toHaveClass("px-3", "py-1", "text-xs");
    });

    it("renders with md size", () => {
      render(
        <TabNav value="tab1" onValueChange={() => {}} size="md">
          <TabNavItem value="tab1" data-testid="item">
            Tab 1
          </TabNavItem>
        </TabNav>
      );

      const item = screen.getByTestId("item");
      expect(item).toHaveClass("px-4", "text-sm");
    });

    it("renders with lg size", () => {
      render(
        <TabNav value="tab1" onValueChange={() => {}} size="lg">
          <TabNavItem value="tab1" data-testid="item">
            Tab 1
          </TabNavItem>
        </TabNav>
      );

      const item = screen.getByTestId("item");
      expect(item).toHaveClass("px-5", "py-2", "text-base");
    });
  });

  describe("Disabled State", () => {
    it("renders disabled item with disabled attribute", () => {
      render(
        <TabNav value="tab1" onValueChange={() => {}}>
          <TabNavItem value="tab1">Tab 1</TabNavItem>
          <TabNavItem value="tab2" disabled>
            Tab 2
          </TabNavItem>
        </TabNav>
      );

      expect(screen.getByRole("tab", { name: /tab 2/i })).toBeDisabled();
    });

    it("applies disabled styles to disabled items", () => {
      render(
        <TabNav value="tab1" onValueChange={() => {}}>
          <TabNavItem value="tab1">Tab 1</TabNavItem>
          <TabNavItem value="tab2" disabled data-testid="disabled-item">
            Tab 2
          </TabNavItem>
        </TabNav>
      );

      const disabledItem = screen.getByTestId("disabled-item");
      expect(disabledItem).toHaveClass("disabled:cursor-not-allowed", "disabled:opacity-50");
    });
  });

  describe("Custom ClassName", () => {
    it("applies custom className to container", () => {
      render(
        <TabNav
          value="tab1"
          onValueChange={() => {}}
          className="custom-class"
          data-testid="tab-nav"
        >
          <TabNavItem value="tab1">Tab 1</TabNavItem>
        </TabNav>
      );

      expect(screen.getByTestId("tab-nav")).toHaveClass("custom-class");
    });

    it("applies custom className to item", () => {
      render(
        <TabNav value="tab1" onValueChange={() => {}}>
          <TabNavItem value="tab1" className="custom-item-class" data-testid="item">
            Tab 1
          </TabNavItem>
        </TabNav>
      );

      expect(screen.getByTestId("item")).toHaveClass("custom-item-class");
    });
  });

  describe("Accessibility", () => {
    it("has correct role structure", () => {
      render(
        <TabNav value="tab1" onValueChange={() => {}}>
          <TabNavItem value="tab1">Tab 1</TabNavItem>
          <TabNavItem value="tab2">Tab 2</TabNavItem>
        </TabNav>
      );

      expect(screen.getByRole("tablist")).toBeInTheDocument();
      expect(screen.getAllByRole("tab")).toHaveLength(2);
    });

    it("items have button type", () => {
      render(
        <TabNav value="tab1" onValueChange={() => {}}>
          <TabNavItem value="tab1">Tab 1</TabNavItem>
        </TabNav>
      );

      expect(screen.getByRole("tab")).toHaveAttribute("type", "button");
    });

    it("supports keyboard focus", async () => {
      const user = userEvent.setup();

      render(
        <TabNav value="tab1" onValueChange={() => {}}>
          <TabNavItem value="tab1">Tab 1</TabNavItem>
          <TabNavItem value="tab2">Tab 2</TabNavItem>
        </TabNav>
      );

      // Tab to first item
      await user.tab();
      expect(screen.getByRole("tab", { name: /tab 1/i })).toHaveFocus();

      // Tab to second item
      await user.tab();
      expect(screen.getByRole("tab", { name: /tab 2/i })).toHaveFocus();
    });
  });

  describe("Error Handling", () => {
    it("throws error when TabNavItem is used outside TabNav", () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        render(<TabNavItem value="tab1">Tab 1</TabNavItem>);
      }).toThrow("TabNavItem must be used within a TabNav");

      consoleSpy.mockRestore();
    });
  });
});
