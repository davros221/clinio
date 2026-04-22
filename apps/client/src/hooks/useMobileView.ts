import { em } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

/** Mantine "sm" breakpoint — the single source of truth for mobile vs desktop */
const MOBILE_BREAKPOINT = em(768);

export const useMobileView = () => {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT})`, false);
};
