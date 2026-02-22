import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "success", "warning", "error", "info"],
      description: "The visual style of the badge",
    },
    size: {
      control: "select",
      options: ["sm", "md"],
      description: "The size of the badge",
    },
    children: {
      control: "text",
      description: "The content of the badge",
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
    children: "Badge",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    children: "Success",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    children: "Warning",
  },
};

export const ErrorVariant: Story = {
  args: {
    variant: "error",
    children: "Error",
  },
};

export const Info: Story = {
  args: {
    variant: "info",
    children: "Info",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    children: "Small",
  },
};

export const Medium: Story = {
  args: {
    size: "md",
    children: "Medium",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Badge variant="default">Default</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="error">Error</Badge>
        <Badge variant="info">Info</Badge>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="default" size="sm">
          Default SM
        </Badge>
        <Badge variant="success" size="sm">
          Success SM
        </Badge>
        <Badge variant="warning" size="sm">
          Warning SM
        </Badge>
        <Badge variant="error" size="sm">
          Error SM
        </Badge>
        <Badge variant="info" size="sm">
          Info SM
        </Badge>
      </div>
    </div>
  ),
};

export const UsageExample: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="font-medium">Status:</span>
        <Badge variant="success">Active</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-medium">Priority:</span>
        <Badge variant="error">High</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-medium">Type:</span>
        <Badge variant="info">Feature</Badge>
      </div>
    </div>
  ),
};
