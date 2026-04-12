import { Button, ButtonProps } from "@mantine/core";
import { ButtonHTMLAttributes } from "react";

type Props = ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>;

export const SubmitButton = (props: Props) => {
  const { children, ...args } = props;
  return (
    <Button
      fullWidth
      mt={"xl"}
      variant={"outline"}
      radius={"xl"}
      size={"md"}
      {...args}
    >
      {children}
    </Button>
  );
};
