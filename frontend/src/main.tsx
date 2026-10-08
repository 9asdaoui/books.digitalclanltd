import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import { BootGate } from "./components/brand/BootGate";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BootGate>
        <App />
      </BootGate>
    </AuthProvider>
  </StrictMode>,
);
