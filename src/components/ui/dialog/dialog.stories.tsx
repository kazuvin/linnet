import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button, Input, Label } from "@/components/ui";
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

const meta = {
  title: "UI/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: "boolean",
      description: "Whether the dialog is open (controlled mode)",
    },
    defaultOpen: {
      control: "boolean",
      description: "The default open state when initially rendered (uncontrolled mode)",
    },
    onOpenChange: {
      action: "onOpenChange",
      description: "Callback when the open state changes",
    },
    modal: {
      control: "boolean",
      description: "Whether the dialog is modal (blocks interaction with the rest of the page)",
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button idleText="Open Dialog" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a description of the dialog. It provides context about what the dialog is for.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>Dialog content goes here. You can add any content you need.</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" idleText="Cancel" />
          </DialogClose>
          <Button idleText="Save Changes" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Small: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button idleText="Open Small Dialog" />
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Small Dialog</DialogTitle>
          <DialogDescription>This is a small dialog with max-width of sm.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>Compact content for smaller dialogs.</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button idleText="Close" />
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Medium: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button idleText="Open Medium Dialog" />
      </DialogTrigger>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Medium Dialog</DialogTitle>
          <DialogDescription>
            This is the default medium size dialog with max-width of md.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>Standard content area suitable for most use cases.</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button idleText="Close" />
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Large: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button idleText="Open Large Dialog" />
      </DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Large Dialog</DialogTitle>
          <DialogDescription>
            This is a large dialog with max-width of lg, suitable for more complex content.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>
            This larger dialog provides more space for content. It is ideal for displaying detailed
            information, forms with multiple fields, or content that requires more horizontal space.
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" idleText="Cancel" />
          </DialogClose>
          <Button idleText="Continue" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const ExtraLarge: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button idleText="Open Extra Large Dialog" />
      </DialogTrigger>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>Extra Large Dialog</DialogTitle>
          <DialogDescription>
            This is an extra large dialog with max-width of xl, perfect for complex interfaces.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>
            The extra large dialog provides maximum space for complex content such as data tables,
            multi-column layouts, or detailed forms. Use this size when you need to display a lot of
            information without scrolling.
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" idleText="Cancel" />
          </DialogClose>
          <Button idleText="Submit" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button idleText="Open Full Width Dialog" />
      </DialogTrigger>
      <DialogContent size="full" className="mx-4">
        <DialogHeader>
          <DialogTitle>Full Width Dialog</DialogTitle>
          <DialogDescription>
            This dialog spans the full width of the viewport (with some margin).
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>
            The full-width dialog is useful for immersive experiences, large data displays, or when
            you need maximum horizontal space. Consider using this for dashboards or data-heavy
            interfaces.
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" idleText="Cancel" />
          </DialogClose>
          <Button idleText="Done" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button idleText="Edit Profile" />
      </DialogTrigger>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you are done.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4 py-4"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Enter your name" defaultValue="John Doe" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              defaultValue="john@example.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              className="min-h-[100px] w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
              placeholder="Tell us about yourself"
            />
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" idleText="Cancel" />
          </DialogClose>
          <Button type="submit" idleText="Save Changes" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const ConfirmationDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" idleText="Delete Item" />
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your item and remove it from
            our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="ghost" idleText="Cancel" />
          </DialogClose>
          <Button idleText="Delete" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const AlertDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button idleText="Show Alert" />
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Session Expired</DialogTitle>
          <DialogDescription>
            Your session has expired due to inactivity. Please log in again to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button idleText="OK" />
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary" size="sm" idleText="Small" />
        </DialogTrigger>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Small (sm)</DialogTitle>
            <DialogDescription>max-width: 24rem (384px)</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>This is the small size variant.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button idleText="Close" />
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary" size="sm" idleText="Medium" />
        </DialogTrigger>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Medium (md)</DialogTitle>
            <DialogDescription>max-width: 28rem (448px) - Default</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>This is the medium size variant (default).</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button idleText="Close" />
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary" size="sm" idleText="Large" />
        </DialogTrigger>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Large (lg)</DialogTitle>
            <DialogDescription>max-width: 32rem (512px)</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>This is the large size variant.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button idleText="Close" />
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary" size="sm" idleText="Extra Large" />
        </DialogTrigger>
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>Extra Large (xl)</DialogTitle>
            <DialogDescription>max-width: 36rem (576px)</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>This is the extra large size variant.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button idleText="Close" />
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary" size="sm" idleText="Full Width" />
        </DialogTrigger>
        <DialogContent size="full" className="mx-4">
          <DialogHeader>
            <DialogTitle>Full Width (full)</DialogTitle>
            <DialogDescription>max-width: 100%</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>This is the full width size variant.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button idleText="Close" />
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ),
};
