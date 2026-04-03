import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./api/clientService.ts";
import "./i18n"; // initialize i18next before rendering
import { setupZodErrorMap } from "./i18n/zodErrorMap";
import App from "./App.tsx";
import "@mantine/core/styles.css";

// always import additional mantine styles after core styles to ensure proper theming
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "./index.css";

setupZodErrorMap();

const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
