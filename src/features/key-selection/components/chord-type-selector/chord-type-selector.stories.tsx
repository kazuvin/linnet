import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { ChordTypeSelector } from "./chord-type-selector";

const meta = {
  title: "Features/KeySelection/ChordTypeSelector",
  component: ChordTypeSelector,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ChordTypeSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "triad",
    onValueChange: () => {},
  },
  render: function Render() {
    const [value, setValue] = useState<"triad" | "seventh">("triad");
    return (
      <div className="flex items-center gap-4">
        <ChordTypeSelector value={value} onValueChange={setValue} />
        <p className="text-foreground/70 text-sm">
          選択中: <span className="font-medium text-foreground">{value}</span>
        </p>
      </div>
    );
  },
};

export const SeventhSelected: Story = {
  args: {
    value: "seventh",
    onValueChange: () => {},
  },
  render: function Render() {
    const [value, setValue] = useState<"triad" | "seventh">("seventh");
    return <ChordTypeSelector value={value} onValueChange={setValue} />;
  },
};
