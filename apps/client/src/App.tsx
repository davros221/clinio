import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { RouterProvider } from "react-router";
import "./App.css";
import { router } from "@router";
import { theme } from "./theme";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@api";
import { ErrorBoundary } from "react-error-boundary";
import { CommonErrorPage } from "@pages";

export default function App() {
  return (
    <ErrorBoundary fallback={<CommonErrorPage />}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme}>
          <ModalsProvider>
            <Notifications />

            <RouterProvider router={router} />
          </ModalsProvider>
        </MantineProvider>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
