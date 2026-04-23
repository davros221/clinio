import { useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

export const useMobileView = () => {
  const theme = useMantineTheme();
  // `sm` is the desktop min-width (AppShell uses breakpoint "sm"), so mobile is one pixel below.
  return useMediaQuery(`(max-width: calc(${theme.breakpoints.sm} - 0.0625em))`);
};
