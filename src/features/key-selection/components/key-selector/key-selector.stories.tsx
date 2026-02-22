import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { _resetKeyStoreForTesting } from "../../stores/key-store";
import { KeySelector } from "./key-selector";

const meta = {
  title: "Features/KeySelection/KeySelector",
  component: KeySelector,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      _resetKeyStoreForTesting();
      return <Story />;
    },
  ],
} satisfies Meta<typeof KeySelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
