import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "../input";
import { Label } from "./label";

const meta = {
  title: "UI/Label",
  component: Label,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    required: {
      control: "boolean",
      description: "Whether to show the required indicator",
    },
    children: {
      control: "text",
      description: "The label text",
    },
    htmlFor: {
      control: "text",
      description: "The ID of the associated form element",
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Email",
  },
};

export const Required: Story = {
  args: {
    children: "Email",
    required: true,
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="Enter your email" />
    </div>
  ),
};

export const WithRequiredInput: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-2">
      <Label htmlFor="password" required>
        Password
      </Label>
      <Input id="password" type="password" placeholder="Enter your password" />
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <form className="flex w-80 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name" required>
          Name
        </Label>
        <Input id="name" placeholder="John Doe" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email-form" required>
          Email
        </Label>
        <Input id="email-form" type="email" placeholder="john@example.com" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="bio">Bio</Label>
        <Input id="bio" placeholder="Tell us about yourself" />
      </div>
    </form>
  ),
};
