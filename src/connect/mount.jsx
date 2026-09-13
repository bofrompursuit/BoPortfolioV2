import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ConnectSection from "./ConnectSection";

export function mountConnect(element) {
  createRoot(element).render(
    <StrictMode>
      <ConnectSection />
    </StrictMode>
  );
}
