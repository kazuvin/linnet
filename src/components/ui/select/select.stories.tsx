import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Select } from "./select";

const meta = {
  title: "UI/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const FRUIT_OPTIONS = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "grape", label: "Grape" },
];

export const Default: Story = {
  args: {
    value: "apple",
    onValueChange: () => {},
    options: FRUIT_OPTIONS,
  },
  render: function Render() {
    const [value, setValue] = useState("apple");
    return (
      <div className="flex flex-col items-center gap-4">
        <Select value={value} onValueChange={setValue} options={FRUIT_OPTIONS} />
        <p className="text-foreground/70 text-sm">
          Selected: <span className="font-medium text-foreground">{value}</span>
        </p>
      </div>
    );
  },
};

export const WithPlaceholder: Story = {
  args: {
    value: "",
    onValueChange: () => {},
    options: FRUIT_OPTIONS,
    placeholder: "Choose a fruit...",
  },
  render: function Render() {
    const [value, setValue] = useState("");
    return (
      <Select
        value={value}
        onValueChange={setValue}
        options={FRUIT_OPTIONS}
        placeholder="Choose a fruit..."
      />
    );
  },
};
