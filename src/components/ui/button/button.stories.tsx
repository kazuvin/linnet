import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost"],
      description: "The visual style of the button",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "The size of the button",
    },
    state: {
      control: "select",
      options: ["idle", "loading", "success", "error"],
      description: "The current state of the button",
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
    },
    idleText: {
      control: "text",
      description: "Text displayed in idle state",
    },
    loadingText: {
      control: "text",
      description: "Text displayed in loading state",
    },
    successText: {
      control: "text",
      description: "Text displayed in success state",
    },
    errorText: {
      control: "text",
      description: "Text displayed in error state",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
    idleText: "Primary Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    idleText: "Secondary Button",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    idleText: "Ghost Button",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    idleText: "Small Button",
  },
};

export const Medium: Story = {
  args: {
    size: "md",
    idleText: "Medium Button",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    idleText: "Large Button",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    idleText: "Disabled Button",
  },
};

export const Loading: Story = {
  args: {
    state: "loading",
    loadingText: "Loading...",
  },
};

export const Success: Story = {
  args: {
    state: "success",
    successText: "Success!",
  },
};

export const ErrorState: Story = {
  args: {
    state: "error",
    errorText: "Error!",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button variant="primary" size="sm" idleText="Primary SM" />
        <Button variant="primary" size="md" idleText="Primary MD" />
        <Button variant="primary" size="lg" idleText="Primary LG" />
      </div>
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" idleText="Secondary SM" />
        <Button variant="secondary" size="md" idleText="Secondary MD" />
        <Button variant="secondary" size="lg" idleText="Secondary LG" />
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" idleText="Ghost SM" />
        <Button variant="ghost" size="md" idleText="Ghost MD" />
        <Button variant="ghost" size="lg" idleText="Ghost LG" />
      </div>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <h4 className="font-medium text-sm">All Button States</h4>
      <div className="flex flex-wrap items-center gap-3">
        <Button state="idle" idleText="Idle" />
        <Button state="loading" loadingText="Loading..." />
        <Button state="success" successText="Success!" />
        <Button state="error" errorText="Error!" />
      </div>
    </div>
  ),
};
