import { Meta, StoryObj } from "@storybook/react";
import { AuthFooter } from "./AuthFooter";

const meta = {
  component: AuthFooter,
  title: "Auth Footer",
  tags: ["autodocs"],
  argTypes: {
    links: {
      control: "check",
      options: ["login", "signUp", "forgotPassword"],
    },
  },
} satisfies Meta<typeof AuthFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    links: ["login", "signUp"],
  },
};
