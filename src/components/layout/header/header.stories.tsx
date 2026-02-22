import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Header,
  HeaderGitHubLink,
  HeaderLogo,
  HeaderNav,
  HeaderNavItem,
  HeaderNavList,
} from "./header";

const meta = {
  title: "UI/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Header>
      <HeaderLogo />
    </Header>
  ),
};

export const WithNavigation: Story = {
  render: () => (
    <Header>
      <HeaderLogo />
      <HeaderNav>
        <HeaderNavList>
          <HeaderNavItem href="/blog">Blog</HeaderNavItem>
          <HeaderNavItem href="/about">About</HeaderNavItem>
        </HeaderNavList>
      </HeaderNav>
    </Header>
  ),
};

export const WithGitHub: Story = {
  render: () => (
    <Header>
      <HeaderLogo />
      <HeaderNav>
        <HeaderGitHubLink url="https://github.com/username/blog-app" />
      </HeaderNav>
    </Header>
  ),
};

export const Full: Story = {
  render: () => (
    <Header>
      <HeaderLogo />
      <HeaderNav>
        <HeaderNavList>
          <HeaderNavItem href="/blog">Blog</HeaderNavItem>
          <HeaderNavItem href="/about">About</HeaderNavItem>
          <HeaderNavItem href="/contact">Contact</HeaderNavItem>
        </HeaderNavList>
        <HeaderGitHubLink url="https://github.com/username/blog-app" />
      </HeaderNav>
    </Header>
  ),
};
