import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App.jsx";

// Vite / browser: use path-based routing ("/" = landing). HashRouter with no "#" in the URL
// often fails to match "/", so the first screen is blank. Packaged Electron uses file:// and
// must keep hash routing for client-side paths.
const useFileProtocol = typeof window !== "undefined" && window.location.protocol === "file:";
if (useFileProtocol && !window.location.hash) {
  window.location.hash = "#/";
}
const Router = useFileProtocol ? HashRouter : BrowserRouter;

// GitHub Pages is served under /digital_twin/ — import.meta.env.BASE_URL must match vite base.
function routerBasename() {
  if (useFileProtocol) return undefined;
  const raw = import.meta.env.BASE_URL ?? "/";
  const trimmed = raw.replace(/\/$/, "");
  if (!trimmed || trimmed === "." || raw === "/" || raw === "./") return undefined;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router basename={routerBasename()}>
      <App />
    </Router>
  </StrictMode>
);
