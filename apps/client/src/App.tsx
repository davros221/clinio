import { MantineProvider } from "@mantine/core";
import { RouterProvider } from "react-router";
import "./App.css";
import { router } from "./router/router.tsx";
import { theme } from "./theme";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <Notifications />

        <RouterProvider router={router} />
      </MantineProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
