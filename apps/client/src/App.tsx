import { MantineProvider } from "@mantine/core";
import { RouterProvider } from "react-router";
import "./App.css";
import { router } from "./router/router.tsx";
import { theme } from "./theme";
import { Notifications } from "@mantine/notifications";

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <Notifications />

      <RouterProvider router={router} />
    </MantineProvider>
  );
}
