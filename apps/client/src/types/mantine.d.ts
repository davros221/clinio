import "@mantine/core";
import { fontSizes, radius, spacing } from "@/configs/mantine/theme";

declare module "@mantine/core" {
  export interface MantineThemeSizesOverride {
    spacing: typeof spacing;
    fontSizes: typeof fontSizes;
    radius: typeof radius;
  }
}
