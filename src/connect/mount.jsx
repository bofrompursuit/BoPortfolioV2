import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ConnectExperience from "./ConnectExperience";

export function mountConnect(element) {
  createRoot(element).render(
    <StrictMode>
      <ConnectExperience />
    </StrictMode>
  );
}
