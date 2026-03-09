import { StrictMode } from "react";
import * as ReactDOM from "react-dom/client";
import "./api/client";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <StrictMode>
    <h1>ClinIO App!</h1>
  </StrictMode>
);
