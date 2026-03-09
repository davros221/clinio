import { StrictMode } from "react";
import * as ReactDOM from "react-dom/client";
import "./api/client";
import { AppComponent } from "./appComponent";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <StrictMode>
    <AppComponent />
  </StrictMode>
);
