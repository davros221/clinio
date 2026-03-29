import { Meta, StoryObj } from "@storybook/react";
import { SubmitButton } from "./SubmitButton";

const meta = {
  component: SubmitButton,
  title: "Submit Button",
  tags: ["autodocs"],
  argTypes: {
    loading: { type: "boolean" },
    children: {
      table: { disable: true },
    },
    disabled: { type: "boolean" },
  },
} satisfies Meta<typeof SubmitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BaseButton: Story = {
  args: {
    loading: false,
    children: "Click me!",
    disabled: false,
  },
};
