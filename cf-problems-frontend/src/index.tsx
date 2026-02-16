import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import ThemeProvider from "./components/ThemeProvider";

import "./style/index.scss";

import App from "./App";

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
