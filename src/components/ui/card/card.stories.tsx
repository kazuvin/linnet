import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "../button";
import { Card, CardContent, CardFooter, CardHeader } from "./card";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
      description: "The visual style of the card",
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardContent>
        <p>This is a simple card with some content.</p>
      </CardContent>
    </Card>
  ),
};

export const Outline: Story = {
  render: () => (
    <Card variant="outline" className="w-80">
      <CardContent>
        <p>This is an outline card with some content.</p>
      </CardContent>
    </Card>
  ),
};

export const WithHeader: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <h3 className="font-semibold text-lg">Card Title</h3>
        <p className="text-foreground/60 text-sm">Card description</p>
      </CardHeader>
      <CardContent>
        <p>This card has a header section with a title and description.</p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="w-80">
      <CardContent>
        <p>This card has a footer with action buttons.</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="ghost" idleText="Cancel" />
        <Button idleText="Submit" />
      </CardFooter>
    </Card>
  ),
};

export const FullExample: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <h3 className="font-semibold text-lg">Create Account</h3>
        <p className="text-foreground/60 text-sm">Enter your information to create an account</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <label className="font-medium text-sm">Name</label>
          <input
            className="mt-1 w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="font-medium text-sm">Email</label>
          <input
            className="mt-1 w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2"
            placeholder="john@example.com"
            type="email"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="ghost" idleText="Cancel" />
        <Button idleText="Create Account" />
      </CardFooter>
    </Card>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Card className="w-64">
        <CardHeader>
          <h3 className="font-semibold">Default</h3>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/60 text-sm">Default card variant</p>
        </CardContent>
      </Card>
      <Card variant="outline" className="w-64">
        <CardHeader>
          <h3 className="font-semibold">Outline</h3>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/60 text-sm">Outline card variant</p>
        </CardContent>
      </Card>
    </div>
  ),
};
