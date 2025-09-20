import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./stores/ThemeProvider"
import { AccessibilityProvider } from "./providers/AccessibilityProvider"; // Verify this file exists
import { ResponsiveProvider } from "./providers/ResponsiveProvider";
import { DragDropProvider } from "./providers/DragDropProvider";
import { NotificationProvider } from "./providers/NotificationProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <NotificationProvider>
      <ThemeProvider>
        <AccessibilityProvider>
          <ResponsiveProvider>
            <DragDropProvider>
              <App />
            </DragDropProvider>
          </ResponsiveProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </NotificationProvider>
  </React.StrictMode>,
);
