import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { TabNav, TabNavItem } from "./tab-nav";

const meta = {
  title: "UI/TabNav",
  component: TabNav,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost"],
      description: "The visual variant of the tab nav",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "The size of the tab nav",
    },
    value: {
      control: "text",
      description: "The currently selected value",
    },
    onValueChange: {
      action: "onValueChange",
      description: "Callback when selection changes",
    },
  },
} satisfies Meta<typeof TabNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "tab1",
    onValueChange: () => {},
    children: undefined,
  },
  render: function Render() {
    const [value, setValue] = useState("tab1");
    return (
      <TabNav value={value} onValueChange={setValue}>
        <TabNavItem value="tab1">Tab 1</TabNavItem>
        <TabNavItem value="tab2">Tab 2</TabNavItem>
        <TabNavItem value="tab3">Tab 3</TabNavItem>
      </TabNav>
    );
  },
};

export const Primary: Story = {
  args: {
    value: "option1",
    variant: "primary",
    onValueChange: () => {},
    children: undefined,
  },
  render: function Render() {
    const [value, setValue] = useState("option1");
    return (
      <TabNav value={value} onValueChange={setValue} variant="primary">
        <TabNavItem value="option1">Option 1</TabNavItem>
        <TabNavItem value="option2">Option 2</TabNavItem>
        <TabNavItem value="option3">Option 3</TabNavItem>
      </TabNav>
    );
  },
};

export const Secondary: Story = {
  args: {
    value: "option1",
    variant: "secondary",
    onValueChange: () => {},
    children: undefined,
  },
  render: function Render() {
    const [value, setValue] = useState("option1");
    return (
      <TabNav value={value} onValueChange={setValue} variant="secondary">
        <TabNavItem value="option1">Option 1</TabNavItem>
        <TabNavItem value="option2">Option 2</TabNavItem>
        <TabNavItem value="option3">Option 3</TabNavItem>
      </TabNav>
    );
  },
};

export const Ghost: Story = {
  args: {
    value: "option1",
    variant: "ghost",
    onValueChange: () => {},
    children: undefined,
  },
  render: function Render() {
    const [value, setValue] = useState("option1");
    return (
      <TabNav value={value} onValueChange={setValue} variant="ghost">
        <TabNavItem value="option1">Option 1</TabNavItem>
        <TabNavItem value="option2">Option 2</TabNavItem>
        <TabNavItem value="option3">Option 3</TabNavItem>
      </TabNav>
    );
  },
};

export const AllVariants: Story = {
  args: {
    value: "opt1",
    onValueChange: () => {},
    children: undefined,
  },
  render: function Render() {
    const [primary, setPrimary] = useState("opt1");
    const [secondary, setSecondary] = useState("opt1");
    const [ghost, setGhost] = useState("opt1");

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="font-medium text-sm">Primary</span>
          <TabNav value={primary} onValueChange={setPrimary} variant="primary">
            <TabNavItem value="opt1">Option 1</TabNavItem>
            <TabNavItem value="opt2">Option 2</TabNavItem>
            <TabNavItem value="opt3">Option 3</TabNavItem>
          </TabNav>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-medium text-sm">Secondary</span>
          <TabNav value={secondary} onValueChange={setSecondary} variant="secondary">
            <TabNavItem value="opt1">Option 1</TabNavItem>
            <TabNavItem value="opt2">Option 2</TabNavItem>
            <TabNavItem value="opt3">Option 3</TabNavItem>
          </TabNav>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-medium text-sm">Ghost</span>
          <TabNav value={ghost} onValueChange={setGhost} variant="ghost">
            <TabNavItem value="opt1">Option 1</TabNavItem>
            <TabNavItem value="opt2">Option 2</TabNavItem>
            <TabNavItem value="opt3">Option 3</TabNavItem>
          </TabNav>
        </div>
      </div>
    );
  },
};

export const AllSizes: Story = {
  args: {
    value: "opt1",
    onValueChange: () => {},
    children: undefined,
  },
  render: function Render() {
    const [sm, setSm] = useState("opt1");
    const [md, setMd] = useState("opt1");
    const [lg, setLg] = useState("opt1");

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="font-medium text-sm">Small (sm)</span>
          <TabNav value={sm} onValueChange={setSm} size="sm">
            <TabNavItem value="opt1">Option 1</TabNavItem>
            <TabNavItem value="opt2">Option 2</TabNavItem>
            <TabNavItem value="opt3">Option 3</TabNavItem>
          </TabNav>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-medium text-sm">Medium (md)</span>
          <TabNav value={md} onValueChange={setMd} size="md">
            <TabNavItem value="opt1">Option 1</TabNavItem>
            <TabNavItem value="opt2">Option 2</TabNavItem>
            <TabNavItem value="opt3">Option 3</TabNavItem>
          </TabNav>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-medium text-sm">Large (lg)</span>
          <TabNav value={lg} onValueChange={setLg} size="lg">
            <TabNavItem value="opt1">Option 1</TabNavItem>
            <TabNavItem value="opt2">Option 2</TabNavItem>
            <TabNavItem value="opt3">Option 3</TabNavItem>
          </TabNav>
        </div>
      </div>
    );
  },
};

export const Interactive: Story = {
  args: {
    value: "monthly",
    onValueChange: () => {},
    children: undefined,
  },
  render: function Render() {
    const [value, setValue] = useState("monthly");

    return (
      <div className="flex flex-col items-center gap-4">
        <TabNav value={value} onValueChange={setValue} variant="primary">
          <TabNavItem value="monthly">Monthly</TabNavItem>
          <TabNavItem value="yearly">Yearly</TabNavItem>
        </TabNav>
        <p className="text-foreground/70 text-sm">
          Selected: <span className="font-medium text-foreground">{value}</span>
        </p>
      </div>
    );
  },
};

export const WithDisabledItem: Story = {
  args: {
    value: "tab1",
    onValueChange: () => {},
    children: undefined,
  },
  render: function Render() {
    const [value, setValue] = useState("tab1");
    return (
      <TabNav value={value} onValueChange={setValue}>
        <TabNavItem value="tab1">Tab 1</TabNavItem>
        <TabNavItem value="tab2" disabled>
          Tab 2 (Disabled)
        </TabNavItem>
        <TabNavItem value="tab3">Tab 3</TabNavItem>
      </TabNav>
    );
  },
};

export const TwoOptions: Story = {
  args: {
    value: "on",
    onValueChange: () => {},
    children: undefined,
  },
  render: function Render() {
    const [value, setValue] = useState("on");
    return (
      <TabNav value={value} onValueChange={setValue} size="sm">
        <TabNavItem value="on">On</TabNavItem>
        <TabNavItem value="off">Off</TabNavItem>
      </TabNav>
    );
  },
};

export const ManyOptions: Story = {
  args: {
    value: "mon",
    onValueChange: () => {},
    children: undefined,
  },
  render: function Render() {
    const [value, setValue] = useState("mon");
    return (
      <TabNav value={value} onValueChange={setValue} size="sm">
        <TabNavItem value="mon">Mon</TabNavItem>
        <TabNavItem value="tue">Tue</TabNavItem>
        <TabNavItem value="wed">Wed</TabNavItem>
        <TabNavItem value="thu">Thu</TabNavItem>
        <TabNavItem value="fri">Fri</TabNavItem>
        <TabNavItem value="sat">Sat</TabNavItem>
        <TabNavItem value="sun">Sun</TabNavItem>
      </TabNav>
    );
  },
};
