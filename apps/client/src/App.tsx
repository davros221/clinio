import { MantineProvider } from "@mantine/core";
import { RouterProvider } from "react-router";
import "@mantine/core/styles.css";
import "./App.css";
import { router } from "./router/router.tsx";
import { theme } from "./theme";

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <RouterProvider router={router} />
    </MantineProvider>
  );
}
