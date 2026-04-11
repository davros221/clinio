import { createTheme } from "@mantine/core";

export const fontSizes = {
  xs: "12px",
  sm: "14px",
  md: "16px",
  lg: "20px",
  xl: "24px",
} as const;

export const spacing = {
  none: "0px",
  "4xs": "2px",
  xxxs: "4px",
  xxs: "8px",
  xs: "12px",
  s: "16px",
  m: "24px",
  l: "32px",
  xl: "48px",
  xxl: "64px",
  xxxl: "80px",
  "4xl": "96px",
} as const;

export const radius = {
  none: "0px",
  "4xs": "2px",
  xxxs: "4px",
  xxs: "8px",
  xs: "12px",
  s: "16px",
  m: "24px",
  l: "32px",
  xl: "48px",
  full: "1000px",
} as const;

export const theme = createTheme({
  primaryColor: "blue",
  primaryShade: 6,
  fontSizes,
  radius,
  spacing,
  components: {
    Badge: {
      styles: {
        // overrides for badge defaults, mantine clips the text from top
        root: { overflow: "visible" },
        label: { overflow: "visible", lineHeight: "normal" },
      },
    },
  },
});
