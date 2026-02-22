import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { RootNoteSelector } from "./root-note-selector";

const meta = {
  title: "Features/KeySelection/RootNoteSelector",
  component: RootNoteSelector,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RootNoteSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "C",
    onValueChange: () => {},
  },
  render: function Render() {
    const [value, setValue] = useState("C");
    return (
      <div className="flex items-center gap-4">
        <RootNoteSelector value={value} onValueChange={setValue} />
        <p className="text-foreground/70 text-sm">
          選択中: <span className="font-medium text-foreground">{value}</span>
        </p>
      </div>
    );
  },
};

export const SharpSelected: Story = {
  args: {
    value: "F#",
    onValueChange: () => {},
  },
  render: function Render() {
    const [value, setValue] = useState("F#");
    return <RootNoteSelector value={value} onValueChange={setValue} />;
  },
};
