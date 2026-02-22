import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

describe("Dialog", () => {
  describe("DialogTrigger", () => {
    it("opens dialog when clicked", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <button type="button">Open Dialog</button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      // Dialog should not be visible initially
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      // Click the trigger button
      await user.click(screen.getByRole("button", { name: /open dialog/i }));

      // Dialog should now be visible
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("DialogClose", () => {
    it("closes dialog when clicked", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <button type="button">Open Dialog</button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogClose asChild>
              <button type="button">Dismiss</button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      );

      // Open the dialog
      await user.click(screen.getByRole("button", { name: /open dialog/i }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Click the dismiss button (custom DialogClose)
      await user.click(screen.getByRole("button", { name: /dismiss/i }));

      // Dialog should be closed
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("closes dialog when clicking built-in close button", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <button type="button">Open Dialog</button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      // Open the dialog
      await user.click(screen.getByRole("button", { name: /open dialog/i }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Click the built-in close button (X icon with "Close" sr-only text)
      await user.click(screen.getByRole("button", { name: /^close$/i }));

      // Dialog should be closed
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("DialogContent size variants", () => {
    it("renders with sm size variant", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <button type="button">Open</button>
          </DialogTrigger>
          <DialogContent size="sm" data-testid="dialog-content">
            <DialogTitle>Small Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      const content = screen.getByTestId("dialog-content");
      expect(content).toHaveClass("max-w-sm");
    });

    it("renders with md size variant (default)", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <button type="button">Open</button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-content">
            <DialogTitle>Medium Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      const content = screen.getByTestId("dialog-content");
      expect(content).toHaveClass("max-w-md");
    });

    it("renders with lg size variant", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <button type="button">Open</button>
          </DialogTrigger>
          <DialogContent size="lg" data-testid="dialog-content">
            <DialogTitle>Large Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      const content = screen.getByTestId("dialog-content");
      expect(content).toHaveClass("max-w-lg");
    });

    it("renders with xl size variant", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <button type="button">Open</button>
          </DialogTrigger>
          <DialogContent size="xl" data-testid="dialog-content">
            <DialogTitle>XL Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      const content = screen.getByTestId("dialog-content");
      expect(content).toHaveClass("max-w-xl");
    });

    it("renders with full size variant", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <button type="button">Open</button>
          </DialogTrigger>
          <DialogContent size="full" data-testid="dialog-content">
            <DialogTitle>Full Width Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      const content = screen.getByTestId("dialog-content");
      expect(content).toHaveClass("max-w-full");
    });
  });

  describe("DialogTitle and DialogDescription", () => {
    it("renders DialogTitle correctly", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <button type="button">Open</button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>My Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      expect(screen.getByText("My Dialog Title")).toBeInTheDocument();
    });

    it("renders DialogDescription correctly", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <button type="button">Open</button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>This is a description of the dialog.</DialogDescription>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      expect(screen.getByText("This is a description of the dialog.")).toBeInTheDocument();
    });
  });

  describe("DialogHeader and DialogFooter", () => {
    it("DialogHeader renders children", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <button type="button">Open</button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Header Title</DialogTitle>
              <DialogDescription>Header Description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      expect(screen.getByText("Header Title")).toBeInTheDocument();
      expect(screen.getByText("Header Description")).toBeInTheDocument();
    });

    it("DialogFooter renders children", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <button type="button">Open</button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog</DialogTitle>
            <DialogFooter>
              <button type="button">Cancel</button>
              <button type="button">Save</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    });
  });

  describe("Keyboard interactions", () => {
    it("closes dialog when pressing Escape", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <button type="button">Open Dialog</button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      // Open the dialog
      await user.click(screen.getByRole("button", { name: /open dialog/i }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Press Escape
      await user.keyboard("{Escape}");

      // Dialog should be closed
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("Overlay interactions", () => {
    it("closes dialog when clicking overlay", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <button type="button">Open Dialog</button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      // Open the dialog
      await user.click(screen.getByRole("button", { name: /open dialog/i }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Click outside the dialog (on the overlay)
      // The overlay is rendered with data-state attribute
      const overlay = document.querySelector('[data-state="open"].fixed.inset-0');
      expect(overlay).toBeInTheDocument();

      await user.click(overlay as Element);

      // Dialog should be closed
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("Custom className", () => {
    it("applies custom className to DialogContent", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <button type="button">Open</button>
          </DialogTrigger>
          <DialogContent className="custom-dialog-class" data-testid="dialog-content">
            <DialogTitle>Custom Class Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      const content = screen.getByTestId("dialog-content");
      expect(content).toHaveClass("custom-dialog-class");
    });
  });
});
