import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import App from "./App";
import i18n from "./i18n";
import "./index.css";
import "./styles/themes.css";
import "./styles/glass.css";
import "./styles/print-glass.css";

// Initialize performance tracking
import { initPerformanceTracking } from "./utils/performance-metrics";
import { enableBrowserOptimizations } from "./utils/performance-helpers";

// React DevTools in development only
if (import.meta.env.DEV) {
  // React DevTools will be automatically detected by browser extensions
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </StrictMode>
  );

  // Initialize performance tracking after render
  initPerformanceTracking();
  
  // Enable browser optimizations for better performance
  enableBrowserOptimizations();
}