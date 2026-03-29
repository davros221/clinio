import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { Preview } from "@storybook/react";
import { BrowserRouter } from "react-router";

const preview: Preview = {
  decorators: [
    (Story) => (
      <MantineProvider>
        <BrowserRouter>
          <Story />
        </BrowserRouter>
      </MantineProvider>
    ),
  ],
};

export default preview;
