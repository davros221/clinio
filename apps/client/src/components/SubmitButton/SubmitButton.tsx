import { Button, ButtonProps } from "@mantine/core";
import { ButtonHTMLAttributes } from "react";

type Props = ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Re-export of pre-styled Mantine Button component, used as a submit button on various places.
 * It inherits all of Mantine Button's props and adds no additional functionality.
 */
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
