import { StrictMode } from "react";
import "./api/clientService.ts";
import "./i18n"; // initialize i18next before rendering
import "./index.css";
import App from "./App.tsx";
import "@mantine/core/styles.css";
// always import additional mantine styles after core styles to ensure proper theming
import "@mantine/notifications/styles.css";
import { createRoot } from "react-dom/client";
import "@mantine/dates/styles.css";

const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
